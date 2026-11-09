// Error esperado de la lógica de negocio: su mensaje se puede mostrar al usuario tal cual
class ErrorNegocio extends Error {
    constructor(mensaje, status = 400) {
        super(mensaje);
        this.name = 'ErrorNegocio';
        this.status = status;
    }
}

export { ErrorNegocio };
