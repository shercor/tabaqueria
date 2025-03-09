import {DataTypes} from 'sequelize';
import db from '../config/db.js'

const Categoria = db.define('categorias', {
    
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: false
    },

    estado: DataTypes.BOOLEAN

}, {
    hooks: {

    }
})


export default Categoria;