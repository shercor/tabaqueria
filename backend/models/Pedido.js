import {DataTypes} from 'sequelize';
import db from '../config/db.js';
import Usuario from './Usuario.js';

const Pedido = db.define('pedidos', {
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    estado: {
        type: DataTypes.ENUM('carrito', 'pagado', 'enviado', 'entregado', 'cancelado', 'eliminado'),
        allowNull: false,
        defaultValue: 'pendiente',
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Puede ser nulo si se elimina el pedido
    },
    imagen: {
        type: DataTypes.STRING(255),
    },
    delivery: {
        type: DataTypes.BOOLEAN,
    },
    fecha_pedido: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    indexes: [
        {
            name: 'idx_usuario_id',
            fields: ['usuario_id'],
        },
    ],
    hooks: {

    }
})

// Definir la relación con Usuario
Pedido.belongsTo(Usuario, {
    foreignKey: 'usuario_id', // Clave foránea en la tabla `pedidos`
    onDelete: 'CASCADE', // Comportamiento al eliminar el usuario
});


export default Pedido;