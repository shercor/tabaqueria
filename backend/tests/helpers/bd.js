import fs from 'fs';
import mysql from 'mysql2/promise';
import env from '../../src/config/env.js';
import { db } from '../../src/models/index.js';
import migrador from '../../src/database/migrador.js';

const TABLAS = ['detalles_pedidos', 'pedidos', 'metodos_pago', 'productos', 'categorias', 'usuarios'];
const credenciales = {
    host: env.bd.host,
    port: env.bd.puerto,
    user: env.bd.usuario,
    password: env.bd.password,
};

// Conexión propia para vaciar tablas: SET FOREIGN_KEY_CHECKS vale solo para la conexión que lo ejecuta
let conexion;

// Crea la base de pruebas si no existe y le aplica las migraciones pendientes
const prepararBD = async () => {
    const servidor = await mysql.createConnection(credenciales);
    await servidor.query(`CREATE DATABASE IF NOT EXISTS \`${env.bd.nombre}\``);
    await servidor.end();

    await migrador.up();
    conexion = await mysql.createConnection({ ...credenciales, database: env.bd.nombre });
};

const vaciarTablas = async () => {
    await conexion.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const tabla of TABLAS) await conexion.query(`TRUNCATE TABLE \`${tabla}\``);
    await conexion.query('SET FOREIGN_KEY_CHECKS = 1');
};

const cerrarBD = async () => {
    await conexion?.end();
    await db.close();
    fs.rmSync(env.carpetaUploads, { recursive: true, force: true });
};

export { prepararBD, vaciarTablas, cerrarBD };
