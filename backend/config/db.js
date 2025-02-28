import Sequelize from 'sequelize'
import dotenv from 'dotenv'
dotenv.config({path: '.env'})

// Configuracion de la base de datos

const db = new Sequelize(
    process.env.BD_NOMBRE, // Nombre de la BD
    process.env.BD_USER, // Usuario de la db
    process.env.BD_PASSWORD, // Password de la db
    {
        host: process.env.BD_HOST,
        port: 3306,
        dialect: 'mysql',
        define: {
            timestamps: true // Agrega las columnas de creado y actualizado a las nuevas tablas
        },
        pool: { // Configura el comportamiento para conexiones nuevas y existentes
            max: 5, // Cuanto es el maximo de conexiones a mantener
            min: 0, // Minimio de conexiones a mantener
            acquire: 30000, // 30 segundos, tiempo que intentara esperar para concretar una conexion, si no dara error de timeout
            idle: 10000 // 10 segundos, si no hay nada de movimiento en este tiempo, la conexion se finaliza
        },
        operatorAliases: false // Obsoleto
    } // Demas parametros
);

export default db;