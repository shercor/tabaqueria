import Pedido from "../models/Pedido.js";
import DetallePedido from "../models/DetallePedido.js";
import Producto from "../models/Producto.js";
import db from "../config/db.js";
import { Op } from 'sequelize';

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

    async restarProducto(userId, productoId, pedidoId, cantidad, detalleProductoId) {
        const transaction = await db.transaction(); // Iniciar transacción
        console.log('Las variables son:');
        console.log('Usuario ID:', userId);
        console.log('Producto ID:', productoId);
        console.log('Pedido ID:', pedidoId);
        console.log('Cantidad a restar:', cantidad);
        console.log('Detalle Producto ID:', detalleProductoId);
        // return;
        try {
            // Validar que el producto existe
            const producto = await Producto.findByPk(productoId);
            if (!producto) {
                console.log(producto);
                console.log("El producto no existe");
                throw new Error("El producto no existe");
            }

            // Buscar un pedido en estado "carrito" para el usuario
            const pedido = await Pedido.findOne({
                where: { usuario_id: userId, estado: 'carrito' },
                transaction
            });

            if (!pedido) {
                throw new Error("No tienes un carrito activo");
            }

            // Buscar el detalle del producto en el pedido
            const detalle = await DetallePedido.findByPk(detalleProductoId);


            if (!detalle) {
                throw new Error("Este producto no está en el carrito");
            }

            // Calcular nueva cantidad
            const nuevaCantidad = cantidad - 1;

            console.log('La nueva cantidad es:', nuevaCantidad);
            // return;

            if (nuevaCantidad < 0 ) {
                throw new Error("No puedes restar más productos de los que tienes en el carrito");
            }

            // if (nuevaCantidad === 0) {
            //     // Si la cantidad llega a 0, eliminar el detalle del pedido
            //     await detalle.destroy({ transaction });
            // } else {
            //     // Si aún queda cantidad, actualizarla
            //     detalle.cantidad = nuevaCantidad;
            //     await detalle.save({ transaction });
            // }

            detalle.cantidad = nuevaCantidad;
            await detalle.save({ transaction });

            // Recalcular el total del pedido
            const detalles = await DetallePedido.findAll({
                where: { pedido_id: pedido.id },
                transaction
            });

            const nuevoTotal = detalles.reduce((total, item) => {
                return total + (item.precio * item.cantidad);
            }, 0);

            await pedido.update({ total: nuevoTotal }, { transaction });

            await transaction.commit();
            return { success: true, message: "Producto restado del carrito", pedido };

        } catch (error) {
            await transaction.rollback();
            console.error("Error en restarProducto:", error);
            return { success: false, message: error.message };
        }
    }

    async obtenerCarrito(userId) {
        try {
            const pedido = await Pedido.findOne({
                where: { usuario_id: userId, estado: 'carrito' },
                include: [
                    {
                        model: DetallePedido,
                        as: 'detalles_pedido',
                        where: {
                            cantidad: {
                                [Op.ne]: 0 
                            }
                        },
                        include: [
                            {
                                model: Producto,
                                attributes: ['id', 'nombre', 'precio', 'imagen'],
                            }
                        ]
                    }
                ]
            });
            if (!pedido) {
                return { success: false, message: "No hay carrito para este usuario" };
            }
            return { success: true, pedido };
        } catch (error) {
            console.error("Error en obtenerCarrito:", error);
            return { success: false, message: error.message };
        }
    }

    async eliminarProducto(pedidoId, productoId) {
        try {
            console.log('El id del pedido es:', pedidoId);
            console.log('El id del producto es:', productoId);
            // const detalle = await DetallePedido.findOne({
            //     where: { pedido_id: pedidoId, producto_id: productoId }
            // });
            const detalle = await DetallePedido.findOne({
                where: {id: productoId }
            });
            if (!detalle) {
                console.log("El producto no está en el carrito");
                return { success: false, message: "El producto no está en el carrito" };
            }

            const pedido = await Pedido.findByPk(pedidoId);
            if (!pedido) {
                console.log("El pedido no existe");
                return { success: false, message: "El pedido no existe" };
            }

            // Calcular el nuevo total
            const nuevoTotal = parseFloat(pedido.total) - (detalle.precio * detalle.cantidad);
            await pedido.update({ total: nuevoTotal });

            // await detalle.destroy(); // Eliminar el detalle del pedido
            // en lugar de eliminarlo, cambiar el valor de cantidad a 0
            detalle.cantidad = 0;
            await detalle.save();
            console.log('Producto eliminado del pedido');

            return { success: true, message: "Producto eliminado del carrito" };
        }
        catch (error) {
            console.error("Error en eliminarDelCarro:", error);
            return { success: false, message: error.message };
        }
    }

    async actualizarEstado(pedidoId, nuevoEstado) {

        // Buscar el pedido con sus detalles (si son necesarios para validar)
        const pedido = await Pedido.findByPk(pedidoId, {
            include: {
                model: DetallePedido,
                as: 'detalles_pedido',
            }
        });

        

         if (!pedido) {
            throw new Error('Pedido no encontrado');
        }

        const transicionesValidas = {
            carrito: ['pagado', 'cancelado'],
            pagado: ['enviado', 'cancelado'],
            enviado: ['entregado'],
            entregado: [],
            cancelado: [],
        };

        if (!transicionesValidas[pedido.estado].includes(nuevoEstado)) {
            throw new Error(`No se puede cambiar de ${pedido.estado} a ${nuevoEstado}`);
        }

        const transaction = await db.transaction();
        try {
            const pedido = await Pedido.findOne({
                where: { usuario_id: userId, estado: 'carrito' },
                include: [
                    {
                        model: DetallePedido,
                        as: 'detalles_pedido',
                    }
                ],
                transaction
            });
            if (!pedido) {
                return { success: false, message: "No hay carrito para este usuario" };
            }

            // Cambiar el estado del pedido a 'finalizado'
            await pedido.update({ estado: 'finalizado' }, { transaction });

            await transaction.commit();
            return { success: true, message: "Pedido finalizado", pedido };
        } catch (error) {
            await transaction.rollback();
            console.error("Error en finalizarPedido:", error);
            return { success: false, message: error.message };
        }
    }

    async cambiarEstado(id, nuevoEstado, delivery) {
        const transaction = await db.transaction();
        try {
            // Buscar el pedido por ID
            const pedido = await Pedido.findByPk(id, { transaction, lock: true });
            if (!pedido) {
                throw new Error('Pedido no encontrado');
            }

            // Se valida que el nuevo estado sea uno de los estados válidos
            const estadosValidos = ['carrito', 'pagado', 'enviado', 'entregado', 'cancelado', 'eliminado'];
            if (!estadosValidos.includes(nuevoEstado)) {
                throw new Error('El estado al que se quiere cambiar no es válido');
            }

            // Se valida si la transición es válida
            const transicionesValidas = {
                carrito: ['pagado', 'eliminado'],
                pagado: ['enviado', 'cancelado'],
                enviado: ['entregado', 'cancelado'],
                entregado: [],
                cancelado: [],
                eliminado: [],
            };

            if (!transicionesValidas[pedido.estado].includes(nuevoEstado)) {
                throw new Error(`No se puede cambiar de ${pedido.estado} a ${nuevoEstado}`);
            }

            // Actualizar el estado del pedido
            pedido.estado = nuevoEstado;
            if (delivery !== undefined) {
                pedido.delivery = delivery; // Actualizar el campo delivery si se proporciona
            }
            
            await pedido.save({ transaction });

            await transaction.commit();
            return pedido;
        } catch (error) {
            await transaction.rollback();
            console.error("Error al cambiar el estado del pedido:", error);
            throw error;
        }
    }
}

export default new PedidosService();
