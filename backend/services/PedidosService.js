import Pedido from "../models/Pedido.js";
import DetallePedido from "../models/DetallePedido.js";
import Producto from "../models/Producto.js";
import db from "../config/db.js";

class PedidosService {
    async agregarProducto(userId, productoId, cantidad) {
        const transaction = await db.transaction(); // Iniciar transacción

        try {
            // Validar que el producto existe y obtener su precio
            const producto = await Producto.findByPk(productoId);
            if (!producto) {
                console.log("El producto no existe");
                throw new Error("El producto no existe");
            }

            // Buscar si el usuario ya tiene un pedido en estado "carrito"
            let pedido = await Pedido.findOne({
                where: { usuario_id: userId, estado: 'carrito' },
                transaction
            });

            if (!pedido) {
                // Crear un nuevo pedido en estado "carrito"
                pedido = await Pedido.create({
                    usuario_id: userId,
                    total: 0,
                    estado: 'carrito'
                }, { transaction });
            }

            // Buscar si el producto ya está en el pedido
            let detalle = await DetallePedido.findOne({
                where: { pedido_id: pedido.id, producto_id: productoId },
                transaction
            });

            if (detalle) {
                // Si el producto ya está en el pedido, aumentar la cantidad
                detalle.cantidad += cantidad;
                detalle.precio = producto.precio; // Asegurar que el precio es el actual
                await detalle.save({ transaction });
            } else {
                // Si no, agregar un nuevo detalle de pedido
                detalle = await DetallePedido.create({
                    pedido_id: pedido.id,
                    producto_id: productoId,
                    cantidad,
                    precio: producto.precio // Se guarda el precio en el momento de la compra
                }, { transaction });
            }

            console.log('Producto agregado al pedido');

            // Calcular el nuevo total dinámicamente
            const nuevoTotal = parseFloat(pedido.total) + (producto.precio * cantidad);
            await pedido.update({ total: nuevoTotal }, { transaction });

            await transaction.commit(); // Confirmar los cambios
            return { success: true, message: "Producto agregado al pedido", pedido };
        } catch (error) {
            await transaction.rollback(); // Deshacer cambios en caso de error
            console.error("Error en agregarProducto:", error);
            return { success: false, message: error.message };
        }
    }
}

export default new PedidosService();
