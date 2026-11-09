import { Op } from 'sequelize';
import db from "../config/db.js";
import Pedido, { ESTADOS_PEDIDO } from "../models/Pedido.js";
import DetallePedido from "../models/DetallePedido.js";
import Producto from "../models/Producto.js";
import Usuario from "../models/Usuario.js";
import { ErrorNegocio } from "../helpers/http.js";

const TRANSICIONES_VALIDAS = {
    carrito: ['pagado', 'eliminado'],
    pagado: ['enviado', 'cancelado'],
    enviado: ['entregado', 'cancelado'],
    entregado: [],
    cancelado: [],
    eliminado: [],
};

const validarTransicion = (estadoActual, nuevoEstado) => {
    if (!ESTADOS_PEDIDO.includes(nuevoEstado)) {
        throw new ErrorNegocio('El estado al que se quiere cambiar no es válido');
    }
    if (!TRANSICIONES_VALIDAS[estadoActual].includes(nuevoEstado)) {
        throw new ErrorNegocio(`No se puede cambiar de ${estadoActual} a ${nuevoEstado}`);
    }
};

// Las líneas con cantidad 0 se conservan como eliminadas y no se muestran
const detallesVisibles = {
    model: DetallePedido,
    as: 'detalles_pedido',
    required: false,
    where: { cantidad: { [Op.gt]: 0 } },
    include: [{ model: Producto, attributes: ['id', 'nombre', 'precio', 'imagen', 'stock'] }]
};

class PedidosService {
    // Serializa las operaciones de carrito de un mismo usuario (evita carritos duplicados por doble clic)
    async #bloquearUsuario(usuarioId, transaction) {
        const usuario = await Usuario.findByPk(usuarioId, { transaction, lock: true });
        if (!usuario) throw new ErrorNegocio('Usuario no encontrado', 401);
    }

    async #buscarCarrito(usuarioId, transaction) {
        return Pedido.findOne({ where: { usuario_id: usuarioId, estado: 'carrito' }, transaction });
    }

    async #buscarDetalleDelCarrito(usuarioId, detalleId, transaction) {
        const carrito = await this.#buscarCarrito(usuarioId, transaction);
        const detalle = carrito && await DetallePedido.findOne({
            where: { id: detalleId, pedido_id: carrito.id, cantidad: { [Op.gt]: 0 } },
            transaction
        });
        if (!detalle) throw new ErrorNegocio('Este producto no está en tu carrito', 404);
        return { carrito, detalle };
    }

    async #recalcularTotal(pedido, transaction) {
        const detalles = await DetallePedido.findAll({ where: { pedido_id: pedido.id }, transaction });
        const total = detalles.reduce((suma, item) => suma + Number(item.precio) * item.cantidad, 0);
        await pedido.update({ total }, { transaction });
    }

    async agregarProducto(usuarioId, productoId, cantidad = 1) {
        return db.transaction(async transaction => {
            await this.#bloquearUsuario(usuarioId, transaction);

            const producto = await Producto.findByPk(productoId, { transaction });
            if (!producto || producto.estado === false) {
                throw new ErrorNegocio('El producto no existe o no está disponible', 404);
            }

            const carrito = await this.#buscarCarrito(usuarioId, transaction)
                ?? await Pedido.create({ usuario_id: usuarioId, total: 0, estado: 'carrito' }, { transaction });

            const detalle = await DetallePedido.findOne({
                where: { pedido_id: carrito.id, producto_id: productoId },
                transaction
            });

            const nuevaCantidad = (detalle?.cantidad ?? 0) + cantidad;
            if (nuevaCantidad > producto.stock) {
                throw new ErrorNegocio(`Solo quedan ${producto.stock} unidades de ${producto.nombre}`);
            }

            if (detalle) {
                // El precio se actualiza al vigente cada vez que se agrega
                await detalle.update({ cantidad: nuevaCantidad, precio: producto.precio }, { transaction });
            } else {
                await DetallePedido.create({
                    pedido_id: carrito.id,
                    producto_id: productoId,
                    cantidad: nuevaCantidad,
                    precio: producto.precio
                }, { transaction });
            }

            await this.#recalcularTotal(carrito, transaction);
            return { success: true, message: 'Producto agregado al carrito', pedido: carrito };
        });
    }

    async restarProducto(usuarioId, detalleId) {
        return db.transaction(async transaction => {
            await this.#bloquearUsuario(usuarioId, transaction);
            const { carrito, detalle } = await this.#buscarDetalleDelCarrito(usuarioId, detalleId, transaction);

            await detalle.update({ cantidad: detalle.cantidad - 1 }, { transaction });
            await this.#recalcularTotal(carrito, transaction);
            return { success: true, message: 'Producto restado del carrito', pedido: carrito };
        });
    }

    async eliminarProducto(usuarioId, detalleId) {
        return db.transaction(async transaction => {
            await this.#bloquearUsuario(usuarioId, transaction);
            const { carrito, detalle } = await this.#buscarDetalleDelCarrito(usuarioId, detalleId, transaction);

            await detalle.update({ cantidad: 0 }, { transaction });
            await this.#recalcularTotal(carrito, transaction);
            return { success: true, message: 'Producto eliminado del carrito', pedido: carrito };
        });
    }

    // Devuelve el carrito activo con sus productos, o pedido null si el usuario no tiene uno
    async obtenerCarrito(usuarioId) {
        const pedido = await Pedido.findOne({
            where: { usuario_id: usuarioId, estado: 'carrito' },
            include: [detallesVisibles],
            order: [[{ model: DetallePedido, as: 'detalles_pedido' }, 'id', 'ASC']]
        });
        return { success: true, pedido };
    }

    // Cierra el carrito: valida y descuenta stock, y lo deja en estado 'pagado'
    async finalizarPedido(usuarioId, pedidoId, delivery) {
        return db.transaction(async transaction => {
            const pedido = await Pedido.findOne({
                where: { id: pedidoId, usuario_id: usuarioId },
                transaction,
                lock: true
            });
            if (!pedido) throw new ErrorNegocio('Pedido no encontrado', 404);
            validarTransicion(pedido.estado, 'pagado');

            const detalles = await DetallePedido.findAll({
                where: { pedido_id: pedido.id, cantidad: { [Op.gt]: 0 } },
                transaction
            });
            if (detalles.length === 0) throw new ErrorNegocio('Tu carrito está vacío');

            const productos = await Producto.findAll({
                where: { id: detalles.map(detalle => detalle.producto_id) },
                transaction,
                lock: true
            });
            const productosPorId = new Map(productos.map(producto => [producto.id, producto]));

            for (const detalle of detalles) {
                const producto = productosPorId.get(detalle.producto_id);
                if (!producto || producto.estado === false) {
                    throw new ErrorNegocio('Uno de los productos de tu carrito ya no está disponible');
                }
                if (producto.stock < detalle.cantidad) {
                    throw new ErrorNegocio(`No hay stock suficiente de ${producto.nombre} (quedan ${producto.stock})`);
                }
            }

            for (const detalle of detalles) {
                await productosPorId.get(detalle.producto_id).decrement('stock', { by: detalle.cantidad, transaction });
            }

            await this.#recalcularTotal(pedido, transaction);
            await pedido.update({ estado: 'pagado', delivery, fecha_pedido: new Date() }, { transaction });
            return pedido;
        });
    }

    // Cambio de estado genérico (para la futura administración de pedidos)
    async cambiarEstado(pedidoId, nuevoEstado) {
        return db.transaction(async transaction => {
            const pedido = await Pedido.findByPk(pedidoId, { transaction, lock: true });
            if (!pedido) throw new ErrorNegocio('Pedido no encontrado', 404);

            validarTransicion(pedido.estado, nuevoEstado);
            await pedido.update({ estado: nuevoEstado }, { transaction });
            return pedido;
        });
    }
}

export default new PedidosService();
