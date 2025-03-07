import { DataTypes } from 'sequelize';
import db from '../config/db.js';
import Pedido from './Pedido.js';
import Producto from './Producto.js';

const DetallePedido = db.define('detalles_pedido', {
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    pedido_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Pedido,
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Producto,
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
}, {
    indexes: [
        {
            name: 'idx_pedido_id',
            fields: ['pedido_id'],
        },
        {
            name: 'idx_producto_id',
            fields: ['producto_id'],
        },
    ],
});

// Definir relaciones
DetallePedido.belongsTo(Pedido, { foreignKey: 'pedido_id', onDelete: 'CASCADE' });
DetallePedido.belongsTo(Producto, { foreignKey: 'producto_id', onDelete: 'CASCADE' });

export default DetallePedido;