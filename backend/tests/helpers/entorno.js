// Entorno de pruebas. Cada archivo de test lo importa antes que cualquier módulo de src/
// Se carga el .env primero para poder definir ahí las TEST_BD_*; lo de abajo pisa el resto
import 'dotenv/config';
import fs from 'fs';
import os from 'os';
import path from 'path';

Object.assign(process.env, {
    NODE_ENV: 'test',
    BD_NOMBRE: process.env.TEST_BD_NOMBRE || 'tabaqueria_test',
    BD_HOST: process.env.TEST_BD_HOST || '127.0.0.1',
    BD_PORT: process.env.TEST_BD_PORT || '4306',
    BD_USER: process.env.TEST_BD_USER || 'root',
    BD_PASSWORD: process.env.TEST_BD_PASSWORD || 'secret',
    BD_LOG: 'false',
    JWT_SECRET: 'secreto-de-pruebas',
    CSRF_SECRET: 'csrf-de-pruebas',
    // Sin servidor SMTP los emails se descartan: evita enviar correos reales desde los tests
    EMAIL_HOST: '',
    UPLOADS_DIR: fs.mkdtempSync(path.join(os.tmpdir(), 'tabaqueria-uploads-')),
});

// Los tests vacían tablas: nunca deben correr contra la base de desarrollo
if (!process.env.BD_NOMBRE.endsWith('_test')) {
    throw new Error(`La base de pruebas debe terminar en _test (se recibió ${process.env.BD_NOMBRE})`);
}
