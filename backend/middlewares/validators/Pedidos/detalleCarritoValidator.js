import { body } from 'express-validator';

// Para quitar una unidad o eliminar una línea del carrito
const detalleCarritoValidator = [
    body('detalleId')
        .isInt({ min: 1 })
        .withMessage('El producto del carrito no es válido')
        .toInt(),
];

export default detalleCarritoValidator;
