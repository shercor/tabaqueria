import { DataTypes } from 'sequelize';
import db from '../config/db.js';
import Producto from './Producto.js'; // 👈 Importa Producto

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
            model: 'pedidos',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'productos',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
}, {
    indexes: [
        { name: 'idx_pedido_id', fields: ['pedido_id'] },
        { name: 'idx_producto_id', fields: ['producto_id'] },
    ],
});

// 🔗 Asociación directa
DetallePedido.belongsTo(Producto, { foreignKey: 'producto_id' });

export default DetallePedido;
