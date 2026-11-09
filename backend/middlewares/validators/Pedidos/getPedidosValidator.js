import { query } from 'express-validator';
import { ESTADOS_PEDIDO } from '../../../models/Pedido.js';

const getPedidosValidator = [
    query('estado')
        .optional()
        .isIn(ESTADOS_PEDIDO)
        .withMessage(`El estado debe ser uno de: ${ESTADOS_PEDIDO.join(', ')}`),

    query('usuario_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('usuario_id debe ser un entero positivo'),

    query('desde')
        .optional()
        .isISO8601()
        .withMessage('desde debe ser una fecha válida (YYYY-MM-DD)'),

    query('hasta')
        .optional()
        .isISO8601()
        .withMessage('hasta debe ser una fecha válida (YYYY-MM-DD)'),

    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('page debe ser un número entero mayor o igual a 1'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('limit debe ser un número entre 1 y 100'),
];

export default getPedidosValidator;
