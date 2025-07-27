// middlewares/validators/putPedidosValidator.js
import { param, body } from 'express-validator';

const putPedidosValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del pedido debe ser un número entero positivo'),

  body('estado')
    .notEmpty()
    .withMessage('El estado es obligatorio')
    .isIn(['pendiente', 'en_proceso', 'entregado', 'cancelado'])
    .withMessage('El estado no es válido'),

  body('observaciones')
    .optional()
    .isString()
    .withMessage('Las observaciones deben ser un texto'),

  body('fecha_entrega')
    .optional()
    .isISO8601()
    .withMessage('La fecha de entrega debe tener un formato válido (ISO 8601)'),
];

export default putPedidosValidator;