import { DataTypes } from 'sequelize';
import db from '../config/database.js';

const Producto = db.define(
    'productos',
    {
        nombre: { type: DataTypes.STRING, allowNull: false },
        descripcion: DataTypes.TEXT,
        // Pesos chilenos, sin decimales
        precio: { type: DataTypes.INTEGER, allowNull: false },
        stock: { type: DataTypes.INTEGER, allowNull: false },
        categoria_id: DataTypes.INTEGER,
        imagen: DataTypes.STRING(255),
        // false = no se puede comprar; null se trata como disponible
        estado: DataTypes.BOOLEAN,
    },
    {
        indexes: [{ name: 'idx_categoria_id', fields: ['categoria_id'] }],
    }
);

export default Producto;
