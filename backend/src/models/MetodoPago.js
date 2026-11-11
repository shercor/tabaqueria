import { DataTypes } from 'sequelize';
import db from '../config/database.js';

// Aún sin uso: reservado para cuando se implemente el pago
const MetodoPago = db.define(
    'metodos_pago',
    {
        usuario_id: { type: DataTypes.INTEGER, allowNull: false },
        tipo: { type: DataTypes.STRING(50), allowNull: false },
        detalles: { type: DataTypes.TEXT, allowNull: false },
    },
    {
        tableName: 'metodos_pago',
        timestamps: false,
    },
);

export default MetodoPago;
