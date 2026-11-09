import { Op } from 'sequelize';
import { db, Pedido, DetallePedido, Producto, Usuario } from '../models/index.js';
import { ErrorNegocio } from '../utils/errores.js';

// Las líneas con cantidad 0 se conservan como eliminadas y no se muestran
const detallesVisibles = {
    model: DetallePedido,
    as: 'detalles_pedido',
    required: false,
    where: { cantidad: { [Op.gt]: 0 } },
    include: [{ model: Producto, attributes: ['id', 'nombre', 'precio', 'imagen', 'stock'] }],
};

// Serializa las operaciones de carrito de un mismo usuario (evita carritos duplicados por doble clic)
const bloquearUsuario = async (usuarioId, transaction) => {
    const usuario = await Usuario.findByPk(usuarioId, { transaction, lock: true });
    if (!usuario) throw new ErrorNegocio('Usuario no encontrado', 401);
};

const buscarCarrito = (usuarioId, transaction) =>
    Pedido.findOne({ where: { usuario_id: usuarioId, estado: 'carrito' }, transaction });

const buscarLineaDelCarrito = async (usuarioId, detalleId, transaction) => {
    const carrito = await buscarCarrito(usuarioId, transaction);
    const detalle =
        carrito &&
        (await DetallePedido.findOne({
            where: { id: detalleId, pedido_id: carrito.id, cantidad: { [Op.gt]: 0 } },
            transaction,
        }));
    if (!detalle) throw new ErrorNegocio('Este producto no está en tu carrito', 404);
    return { carrito, detalle };
};

const recalcularTotal = async (pedido, transaction) => {
    const detalles = await DetallePedido.findAll({ where: { pedido_id: pedido.id }, transaction });
    const total = detalles.reduce((suma, detalle) => suma + detalle.precio * detalle.cantidad, 0);
    await pedido.update({ total }, { transaction });
};

// Ejecuta una operación sobre el carrito dentro de una transacción con el usuario bloqueado
const conCarritoBloqueado = (usuarioId, operacion) =>
    db.transaction(async (transaction) => {
        await bloquearUsuario(usuarioId, transaction);
        return operacion(transaction);
    });

const agregarProducto = (usuarioId, productoId, cantidad = 1) =>
    conCarritoBloqueado(usuarioId, async (transaction) => {
        const producto = await Producto.findByPk(productoId, { transaction });
        if (!producto || producto.estado === false) {
            throw new ErrorNegocio('El producto no existe o no está disponible', 404);
        }

        const carrito =
            (await buscarCarrito(usuarioId, transaction)) ??
            (await Pedido.create({ usuario_id: usuarioId, total: 0, estado: 'carrito' }, { transaction }));

        const detalle = await DetallePedido.findOne({
            where: { pedido_id: carrito.id, producto_id: productoId },
            transaction,
        });

        const nuevaCantidad = (detalle?.cantidad ?? 0) + cantidad;
        if (nuevaCantidad > producto.stock) {
            throw new ErrorNegocio(`Solo quedan ${producto.stock} unidades de ${producto.nombre}`);
        }

        // El precio se actualiza al vigente cada vez que se agrega
        if (detalle) {
            await detalle.update({ cantidad: nuevaCantidad, precio: producto.precio }, { transaction });
        } else {
            await DetallePedido.create(
                { pedido_id: carrito.id, producto_id: productoId, cantidad: nuevaCantidad, precio: producto.precio },
                { transaction }
            );
        }

        await recalcularTotal(carrito, transaction);
        return carrito;
    });

const restarProducto = (usuarioId, detalleId) =>
    conCarritoBloqueado(usuarioId, async (transaction) => {
        const { carrito, detalle } = await buscarLineaDelCarrito(usuarioId, detalleId, transaction);
        await detalle.update({ cantidad: detalle.cantidad - 1 }, { transaction });
        await recalcularTotal(carrito, transaction);
        return carrito;
    });

const eliminarProducto = (usuarioId, detalleId) =>
    conCarritoBloqueado(usuarioId, async (transaction) => {
        const { carrito, detalle } = await buscarLineaDelCarrito(usuarioId, detalleId, transaction);
        await detalle.update({ cantidad: 0 }, { transaction });
        await recalcularTotal(carrito, transaction);
        return carrito;
    });

// Carrito activo con sus productos, o null si el usuario no tiene uno
const obtener = (usuarioId) =>
    Pedido.findOne({
        where: { usuario_id: usuarioId, estado: 'carrito' },
        include: [detallesVisibles],
        order: [[{ model: DetallePedido, as: 'detalles_pedido' }, 'id', 'ASC']],
    });

export { agregarProducto, restarProducto, eliminarProducto, obtener, recalcularTotal };
