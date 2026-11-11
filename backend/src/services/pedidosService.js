import { Op } from 'sequelize';
import { db, Pedido, DetallePedido, Producto } from '../models/index.js';
import { ErrorNegocio } from '../utils/errores.js';
import { recalcularTotal } from './carritoService.js';

const TRANSICIONES_VALIDAS = {
    carrito: ['pagado', 'eliminado'],
    pagado: ['enviado', 'cancelado'],
    enviado: ['entregado', 'cancelado'],
    entregado: [],
    cancelado: [],
    eliminado: [],
};

const validarTransicion = (estadoActual, nuevoEstado) => {
    if (!TRANSICIONES_VALIDAS[estadoActual].includes(nuevoEstado)) {
        throw new ErrorNegocio(`No se puede cambiar de ${estadoActual} a ${nuevoEstado}`);
    }
};

// Cierra el carrito: valida y descuenta stock, y lo deja en estado 'pagado'
const finalizar = (usuarioId, pedidoId, delivery) =>
    db.transaction(async (transaction) => {
        const pedido = await Pedido.findOne({
            where: { id: pedidoId, usuario_id: usuarioId },
            transaction,
            lock: true,
        });
        if (!pedido) throw new ErrorNegocio('Pedido no encontrado', 404);
        validarTransicion(pedido.estado, 'pagado');

        const detalles = await DetallePedido.findAll({
            where: { pedido_id: pedido.id, cantidad: { [Op.gt]: 0 } },
            transaction,
        });
        if (detalles.length === 0) throw new ErrorNegocio('Tu carrito está vacío');

        // Bloquea los productos para que dos compras simultáneas no vendan el mismo stock
        const productos = await Producto.findAll({
            where: { id: detalles.map((detalle) => detalle.producto_id) },
            transaction,
            lock: true,
        });
        const productosPorId = new Map(productos.map((producto) => [producto.id, producto]));

        for (const detalle of detalles) {
            const producto = productosPorId.get(detalle.producto_id);
            if (!producto || producto.estado === false) {
                throw new ErrorNegocio('Uno de los productos de tu carrito ya no está disponible');
            }
            if (producto.stock < detalle.cantidad) {
                throw new ErrorNegocio(
                    `No hay stock suficiente de ${producto.nombre} (quedan ${producto.stock})`,
                );
            }
        }

        for (const detalle of detalles) {
            await productosPorId
                .get(detalle.producto_id)
                .decrement('stock', { by: detalle.cantidad, transaction });
        }

        await recalcularTotal(pedido, transaction);
        await pedido.update({ estado: 'pagado', delivery, fecha_pedido: new Date() }, { transaction });
        return pedido;
    });

export { finalizar };
