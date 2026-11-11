import { body, param } from 'express-validator';

const agregarAlCarroValidator = [
    body('productoId').isInt({ min: 1 }).withMessage('El producto no es válido').toInt(),
    body('cantidad')
        .optional()
        .isInt({ min: 1, max: 99 })
        .withMessage('La cantidad debe ser un número entero entre 1 y 99')
        .toInt(),
];

// Para quitar una unidad o eliminar una línea del carrito
const detalleCarritoValidator = [
    body('detalleId').isInt({ min: 1 }).withMessage('El producto del carrito no es válido').toInt(),
];

const finalizarPedidoValidator = [
    param('id').isInt({ min: 1 }).withMessage('El ID del pedido debe ser un número entero positivo').toInt(),
    body('delivery')
        .exists()
        .withMessage('Debes indicar si el pedido es con delivery o retiro')
        .bail()
        .isBoolean()
        .withMessage('El campo delivery debe ser un booleano')
        .toBoolean(),
];

export { agregarAlCarroValidator, detalleCarritoValidator, finalizarPedidoValidator };
