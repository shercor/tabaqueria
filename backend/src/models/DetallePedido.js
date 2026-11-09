import { DataTypes } from 'sequelize';
import db from '../config/database.js';

// Una línea del pedido. Al quitarla del carrito queda con cantidad 0 en vez de borrarse
const DetallePedido = db.define(
    'detalles_pedido',
    {
        cantidad: { type: DataTypes.INTEGER, allowNull: false },
        // Precio unitario al momento de agregar el producto
        precio: { type: DataTypes.INTEGER, allowNull: false },
        pedido_id: { type: DataTypes.INTEGER, allowNull: false },
        producto_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
        indexes: [
            { name: 'idx_pedido_id', fields: ['pedido_id'] },
            { name: 'idx_producto_id', fields: ['producto_id'] },
        ],
    },
);

export default DetallePedido;
