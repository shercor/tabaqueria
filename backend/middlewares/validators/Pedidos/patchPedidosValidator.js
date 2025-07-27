// middlewares/validators/putPedidosValidator.js
import { param, body } from 'express-validator';

const patchPedidosValidator = [
  param('id')
    .exists()
    .withMessage('Debes proporcionar el ID del pedido')
    .isInt({ min: 1 })
    .withMessage('El ID del pedido debe ser un número entero positivo'),

  body('estado')
    .optional()
    .isIn(['pendiente', 'en_proceso', 'entregado', 'cancelado']).withMessage('El estado no es válido'),

  body('delivery')
    .optional()
    .isBoolean().withMessage('El campo delivery debe ser un booleano').toBoolean(),

    body('fecha_pedido')
    .optional()
    .isISO8601()
    .withMessage('La fecha del pedido debe tener un formato válido (ISO 8601)'),
];

export default patchPedidosValidator;