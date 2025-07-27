import { validationResult } from 'express-validator';

const validarErrores = (req, res, next) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }

    next(); // si no hay errores, continúa con el siguiente middleware/controlador
};

export default validarErrores;