import { ErrorNegocio, esPeticionJSON } from '../helpers/http.js';

const responder = (req, res, status, mensaje) => {
    if (esPeticionJSON(req)) {
        return res.status(status).json({ success: false, message: mensaje });
    }
    return res.status(status).render('templates/mensaje', {
        pagina: 'Error',
        texto: 'Ocurrió un problema',
        mensaje
    });
};

const rutaNoEncontrada = (req, res) => responder(req, res, 404, 'La página que buscas no existe');

const manejarErrores = (error, req, res, next) => {
    if (error instanceof ErrorNegocio) {
        return responder(req, res, error.status, error.message);
    }
    if (error.code === 'EBADCSRFTOKEN') {
        return responder(req, res, 403, 'El formulario expiró. Recarga la página e inténtalo de nuevo.');
    }

    console.error(error);
    return responder(req, res, 500, 'Error interno del servidor');
};

export { rutaNoEncontrada };
export default manejarErrores;
