import {DataTypes} from 'sequelize';
import db from '../config/db.js';
import Categoria from './Categoria.js';

const Producto = db.define('productos', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
    },
    precio: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    categoria_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Puede ser nulo si se elimina la categoría
    },
    imagen: {
        type: DataTypes.STRING(255),
    },

    estado: DataTypes.BOOLEAN

}, {
    indexes: [
        {
            name: 'idx_categoria_id',
            fields: ['categoria_id'],
        },
    ],
    hooks: {

    }
})

// Definir la relación con Categoria
Producto.belongsTo(Categoria, {
    foreignKey: 'categoria_id', // Clave foránea en la tabla `productos`
    onDelete: 'SET NULL', // Comportamiento al eliminar la categoría
});


export default Producto;