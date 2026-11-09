// Configura la app Express sin levantar el servidor (los tests la importan directo)
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cookieParser from 'cookie-parser';
import env from './config/env.js';
import rutas from './routes/index.js';
import { protegerCsrf, tokenEnVistas } from './middlewares/csrf.js';
import { manejarErrores, rutaNoEncontrada } from './middlewares/errores.js';
import { formatearPesos } from './utils/formato.js';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = express();

// Vistas
app.set('view engine', 'pug');
app.set('views', path.join(raiz, 'views'));
app.locals.nombreTienda = env.nombreTienda;
app.locals.formatearPesos = formatearPesos;

// Archivos estáticos: van antes del resto para no pasar por sesión ni CSRF
app.use(express.static(path.join(raiz, 'public')));
app.use('/uploads', express.static(env.carpetaUploads));
app.use('/vendor/bootstrap', express.static(path.join(raiz, 'node_modules/bootstrap/dist')));

// Body en JSON y formularios. Los formularios con archivos los procesa multer en cada ruta
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(protegerCsrf);
app.use(tokenEnVistas);

app.use(rutas);

app.use(rutaNoEncontrada);
app.use(manejarErrores);

export default app;
