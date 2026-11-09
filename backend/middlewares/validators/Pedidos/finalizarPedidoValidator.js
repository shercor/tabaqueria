import { param, body } from 'express-validator';

const finalizarPedidoValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID del pedido debe ser un número entero positivo')
        .toInt(),

    body('delivery')
        .exists()
        .withMessage('Debes indicar si el pedido es con delivery o retiro')
        .bail()
        .isBoolean()
        .withMessage('El campo delivery debe ser un booleano')
        .toBoolean(),
];

export default finalizarPedidoValidator;
