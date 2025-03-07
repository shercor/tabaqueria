import { DataTypes } from 'sequelize';
import db from '../config/db.js';
import Usuario from './Usuario.js';

const MetodoPago = db.define('metodos_pago', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Usuario,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    tipo: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    detalles: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'metodos_pago',
    timestamps: false
});

// Definir relación con Usuario
MetodoPago.belongsTo(Usuario, { foreignKey: 'usuario_id', onDelete: 'CASCADE' });

export default MetodoPago;
