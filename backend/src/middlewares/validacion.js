import { validationResult } from 'express-validator';

// Para rutas JSON: corta con 400 si alguno de los validators anteriores falló
const validarJSON = (req, res, next) => {
    const errores = validationResult(req).array();
    if (errores.length > 0) {
        return res.status(400).json({ success: false, message: errores[0].msg, errores });
    }
    next();
};

// Para formularios: devuelve los errores para volver a mostrar la vista, o null si no hay
const erroresDeFormulario = (req) => {
    const errores = validationResult(req).array();
    return errores.length > 0 ? errores : null;
};

export { validarJSON, erroresDeFormulario };
