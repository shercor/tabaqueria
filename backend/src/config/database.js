import { Sequelize } from 'sequelize';
import env from './env.js';

const db = new Sequelize(env.bd.nombre, env.bd.usuario, env.bd.password, {
    host: env.bd.host,
    port: env.bd.puerto,
    dialect: 'mysql',
    logging: env.bd.mostrarSql ? console.log : false,
    define: {
        timestamps: true, // createdAt y updatedAt en todas las tablas
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000, // ms máximos esperando una conexión libre
        idle: 10000, // ms sin uso antes de cerrar una conexión
    },
});

export default db;
