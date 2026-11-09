import { validationResult } from 'express-validator';

// Corta la petición con 400 si alguno de los validators anteriores falló (para rutas JSON)
const validarErrores = (req, res, next) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        const lista = errores.array();
        return res.status(400).json({ success: false, message: lista[0].msg, errores: lista });
    }

    next();
};

export default validarErrores;
