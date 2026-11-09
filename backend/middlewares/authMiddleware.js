import jwt from 'jsonwebtoken';
import { esPeticionJSON } from '../helpers/http.js';

// Devuelve el payload del JWT de la cookie, o null si no hay sesión válida
const leerUsuario = req => {
    const token = req.cookies._token;
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return null;
    }
};

// Exige sesión: las vistas redirigen al login y las peticiones JSON reciben 401
const verificarJWT = (req, res, next) => {
    const usuario = leerUsuario(req);

    if (!usuario) {
        if (esPeticionJSON(req)) {
            return res.status(401).json({ success: false, message: 'Debes iniciar sesión' });
        }
        return res.redirect('/auth/login');
    }

    req.usuario = usuario;
    res.locals.usuario = usuario;
    return next();
};

// Carga el usuario si hay sesión, pero deja pasar igual
const usuarioOpcional = (req, res, next) => {
    req.usuario = leerUsuario(req);
    next();
};

export { usuarioOpcional };
export default verificarJWT;
