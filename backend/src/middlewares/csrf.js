import { doubleCsrf } from 'csrf-csrf';
import env from '../config/env.js';
import { COOKIE_SESION } from './auth.js';

const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
    getSecret: () => env.csrfSecret,
    // Ata el token a la sesión: al iniciar o cerrar sesión se genera uno nuevo
    getSessionIdentifier: (req) => req.cookies[COOKIE_SESION] ?? '',
    // El prefijo __Host- exige HTTPS, por eso solo se usa en producción
    cookieName: env.esProduccion ? '__Host-csrf' : '_csrf',
    cookieOptions: { sameSite: 'strict', secure: env.esProduccion },
    // Header en fetch, campo _csrf en formularios y ?_csrf= en formularios con archivos
    getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'] ?? req.body?._csrf ?? req.query?._csrf,
});

// Deja el token disponible en todas las vistas (meta csrf-token y campos _csrf)
const tokenEnVistas = (req, res, next) => {
    res.locals.csrfToken = generateCsrfToken(req, res);
    next();
};

export { doubleCsrfProtection as protegerCsrf, tokenEnVistas };
