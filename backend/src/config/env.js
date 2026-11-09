// Única lectura de process.env de la app: el resto importa este objeto
import 'dotenv/config';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const faltantes = ['BD_NOMBRE', 'BD_USER', 'JWT_SECRET'].filter((nombre) => !process.env[nombre]);
if (faltantes.length > 0) {
    throw new Error(`Faltan variables de entorno: ${faltantes.join(', ')}. Revisa backend/.env (plantilla en example.env)`);
}

const raizBackend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const entorno = process.env.NODE_ENV ?? 'development';
const puerto = Number(process.env.PORT ?? 3000);

const env = {
    entorno,
    esProduccion: entorno === 'production',
    esTest: entorno === 'test',
    puerto,
    // Base de los enlaces que se envían por email
    urlPublica: process.env.APP_URL ?? `${process.env.BACKEND_URL ?? 'http://localhost'}:${puerto}`,
    nombreTienda: process.env.NOMBRE_TIENDA ?? 'Tabaquería',
    carpetaUploads: path.resolve(raizBackend, process.env.UPLOADS_DIR ?? 'public/uploads'),

    bd: {
        nombre: process.env.BD_NOMBRE,
        usuario: process.env.BD_USER,
        password: process.env.BD_PASSWORD ?? '',
        host: process.env.BD_HOST ?? 'localhost',
        puerto: Number(process.env.BD_PORT ?? 3306),
        mostrarSql: process.env.BD_LOG === 'true',
    },

    jwtSecret: process.env.JWT_SECRET,
    // Si no se define, se deriva del JWT_SECRET para no reutilizar la misma clave
    csrfSecret:
        process.env.CSRF_SECRET ?? crypto.createHash('sha256').update(`csrf:${process.env.JWT_SECRET}`).digest('hex'),

    email: {
        host: process.env.EMAIL_HOST,
        puerto: Number(process.env.EMAIL_PORT ?? 587),
        usuario: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASS,
        remitente: process.env.EMAIL_FROM ?? 'Tabaquería <no-reply@tabaqueria.local>',
    },
};

export default env;
