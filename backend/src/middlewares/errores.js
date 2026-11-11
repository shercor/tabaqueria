import { ErrorNegocio } from '../utils/errores.js';
import { esPeticionJSON } from '../utils/peticiones.js';

const responder = (req, res, status, mensaje) => {
    if (esPeticionJSON(req)) {
        return res.status(status).json({ success: false, message: mensaje });
    }
    return res.status(status).render('mensaje', {
        pagina: 'Error',
        titulo: 'Ocurrió un problema',
        mensaje,
        error: true,
        barra: Boolean(res.locals.usuario),
    });
};

const rutaNoEncontrada = (req, res) => responder(req, res, 404, 'La página que buscas no existe');

// Express 5 entrega aquí también los errores de los controladores async
// eslint-disable-next-line no-unused-vars -- Express reconoce el manejador de errores por sus 4 parámetros
const manejarErrores = (error, req, res, next) => {
    if (error instanceof ErrorNegocio) {
        return responder(req, res, error.status, error.message);
    }
    if (error.code === 'EBADCSRFTOKEN') {
        return responder(req, res, 403, 'El formulario expiró. Recarga la página e inténtalo de nuevo.');
    }
    if (error.type === 'entity.parse.failed') {
        return responder(req, res, 400, 'El cuerpo de la petición no es JSON válido');
    }
    // Otros errores 4xx de Express o body-parser (por ejemplo, body demasiado grande)
    if (error.expose && error.status >= 400 && error.status < 500) {
        return responder(req, res, error.status, error.message);
    }

    console.error(error);
    return responder(req, res, 500, 'Error interno del servidor');
};

export { rutaNoEncontrada, manejarErrores };
