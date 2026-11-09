// Única lectura de process.env de la app: el resto importa este objeto
import 'dotenv/config';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

// Una variable vacía en el .env (CSRF_SECRET=) cuenta como no definida, para que aplique el valor por defecto
const leer = (nombre) => process.env[nombre]?.trim() || undefined;

const faltantes = ['BD_NOMBRE', 'BD_USER', 'JWT_SECRET'].filter((nombre) => !leer(nombre));
if (faltantes.length > 0) {
    throw new Error(
        `Faltan variables de entorno: ${faltantes.join(', ')}. Revisa backend/.env (plantilla en example.env)`,
    );
}

const raizBackend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const entorno = leer('NODE_ENV') ?? 'development';
const puerto = Number(leer('PORT') ?? 3000);

const env = {
    entorno,
    esProduccion: entorno === 'production',
    esTest: entorno === 'test',
    puerto,
    // Base de los enlaces que se envían por email
    urlPublica: leer('APP_URL') ?? `${leer('BACKEND_URL') ?? 'http://localhost'}:${puerto}`,
    nombreTienda: leer('NOMBRE_TIENDA') ?? 'Tabaquería',
    carpetaUploads: path.resolve(raizBackend, leer('UPLOADS_DIR') ?? 'public/uploads'),

    bd: {
        nombre: leer('BD_NOMBRE'),
        usuario: leer('BD_USER'),
        password: leer('BD_PASSWORD') ?? '',
        host: leer('BD_HOST') ?? 'localhost',
        puerto: Number(leer('BD_PORT') ?? 3306),
        mostrarSql: leer('BD_LOG') === 'true',
    },

    jwtSecret: leer('JWT_SECRET'),
    // Si no se define, se deriva del JWT_SECRET para no reutilizar la misma clave
    csrfSecret:
        leer('CSRF_SECRET') ??
        crypto
            .createHash('sha256')
            .update(`csrf:${leer('JWT_SECRET')}`)
            .digest('hex'),

    email: {
        host: leer('EMAIL_HOST'),
        puerto: Number(leer('EMAIL_PORT') ?? 587),
        usuario: leer('EMAIL_USER'),
        password: leer('EMAIL_PASS'),
        remitente: leer('EMAIL_FROM') ?? 'Tabaquería <no-reply@tabaqueria.local>',
    },
};

export default env;
