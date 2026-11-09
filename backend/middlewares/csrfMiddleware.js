import crypto from 'crypto';
import { doubleCsrf } from 'csrf-csrf';

const esProduccion = process.env.NODE_ENV === 'production';

// Si no se define CSRF_SECRET se deriva uno del JWT_SECRET, distinto al de los JWT
const secreto = () => process.env.CSRF_SECRET
    ?? crypto.createHash('sha256').update(`csrf:${process.env.JWT_SECRET}`).digest('hex');

const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
    getSecret: secreto,
    // Ata el token a la sesión: al iniciar o cerrar sesión se genera uno nuevo
    getSessionIdentifier: req => req.cookies._token ?? '',
    // El prefijo __Host- exige HTTPS, por eso solo se usa en producción
    cookieName: esProduccion ? '__Host-csrf' : '_csrf',
    cookieOptions: { sameSite: 'strict', secure: esProduccion },
    // Header en fetch, campo _csrf en formularios y ?_csrf= en formularios con archivos
    getCsrfTokenFromRequest: req => req.headers['x-csrf-token'] ?? req.body?._csrf ?? req.query?._csrf,
});

// Deja el token disponible en todas las vistas
const tokenEnVistas = (req, res, next) => {
    res.locals.csrfToken = generateCsrfToken(req, res);
    next();
};

export { doubleCsrfProtection as protegerCsrf, tokenEnVistas, generateCsrfToken };
