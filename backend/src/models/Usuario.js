import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import db from '../config/database.js';

const Usuario = db.define(
    'usuarios',
    {
        nombre: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false },
        password: { type: DataTypes.STRING, allowNull: false },
        // Token de un solo uso para confirmar la cuenta o restablecer el password
        token: DataTypes.STRING,
        confirmado: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
        hooks: {
            // Hashea al crear y cada vez que cambia el password; no vuelve a hashear un hash ya guardado
            beforeSave: async (usuario) => {
                if (!usuario.changed('password')) return;
                usuario.password = await bcrypt.hash(usuario.password, 10);
            },
        },
    },
);

Usuario.prototype.verificarPassword = function (password) {
    return bcrypt.compare(password, this.password);
};

export default Usuario;
