// Error esperado de la lógica de negocio: su mensaje se puede mostrar al usuario
class ErrorNegocio extends Error {
    constructor(mensaje, status = 400) {
        super(mensaje);
        this.status = status;
    }
}

// Indica si la respuesta debe ir en JSON (API o fetch) en vez de una vista
const esPeticionJSON = req =>
    req.originalUrl.startsWith('/api') || req.accepts(['html', 'json']) === 'json';

// Express 4 no captura errores de funciones async: sin esto, un rechazo tumba el proceso
const asyncHandler = controlador => (req, res, next) =>
    Promise.resolve(controlador(req, res, next)).catch(next);

export {
    ErrorNegocio,
    esPeticionJSON,
    asyncHandler
}
