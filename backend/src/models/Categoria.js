import { DataTypes } from 'sequelize';
import db from '../config/database.js';

const Categoria = db.define('categorias', {
    nombre: { type: DataTypes.STRING, allowNull: false },
    descripcion: { type: DataTypes.STRING, allowNull: false },
    estado: DataTypes.BOOLEAN,
});

export default Categoria;
