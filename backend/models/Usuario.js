import {DataTypes} from 'sequelize';
import bcrypt from 'bcryptjs';
import db from '../config/db.js'

const Usuario = db.define('usuarios', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    token: DataTypes.STRING,
    confirmado: DataTypes.BOOLEAN

}, {
    hooks: {
        // Hashea al crear y cada vez que cambia el password; no vuelve a hashear un hash ya guardado
        beforeSave: async function(usuario){
            if (!usuario.changed('password')) return;
            const salt = await bcrypt.genSalt(10)
            usuario.password = await bcrypt.hash( usuario.password , salt);
        }
    }
})

//Métodos personalizados
Usuario.prototype.verificarPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
}

export default Usuario;