import { body } from 'express-validator';

const agregarAlCarroValidator = [
    body('productoId')
        .isInt({ min: 1 })
        .withMessage('El producto no es válido')
        .toInt(),

    body('cantidad')
        .optional()
        .isInt({ min: 1, max: 99 })
        .withMessage('La cantidad debe ser un número entero entre 1 y 99')
        .toInt(),
];

export default agregarAlCarroValidator;
