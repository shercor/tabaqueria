import { verificarJWT } from '../utils/tokens.js';
import { esPeticionJSON } from '../utils/peticiones.js';

const COOKIE_SESION = '_token';

// Payload del JWT de la cookie, o null si no hay sesión válida
const leerSesion = (req) => {
    const token = req.cookies[COOKIE_SESION];
    if (!token) return null;
    try {
        return verificarJWT(token);
    } catch {
        return null;
    }
};

// Exige sesión: las vistas redirigen al login y las peticiones JSON reciben 401
const requerirSesion = (req, res, next) => {
    const usuario = leerSesion(req);

    if (!usuario) {
        if (esPeticionJSON(req)) {
            return res.status(401).json({ success: false, message: 'Debes iniciar sesión' });
        }
        return res.redirect('/auth/login');
    }

    req.usuario = usuario;
    res.locals.usuario = usuario;
    next();
};

export { COOKIE_SESION, requerirSesion };
