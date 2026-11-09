import { body } from 'express-validator';

// Se usa al crear y al editar; el error de la imagen lo deja el middleware subirImagen
const productoValidator = [
    body('nombre')
        .trim()
        .notEmpty()
        .withMessage('El nombre del producto es obligatorio')
        .bail()
        .isLength({ min: 3 })
        .withMessage('El nombre debe tener al menos 3 caracteres'),

    body('descripcion')
        .optional()
        .trim(),

    body('precio')
        .isInt({ min: 100 })
        .withMessage('El precio debe ser un número entero de al menos $100')
        .bail()
        .toInt(),

    body('stock')
        .isInt({ min: 0 })
        .withMessage('El stock debe ser un número entero mayor o igual a 0')
        .bail()
        .toInt(),

    body('categoria_id')
        .optional({ values: 'falsy' })
        .isInt({ min: 1 })
        .withMessage('La categoría no es válida')
        .bail()
        .toInt(),

    body('imagen').custom((valor, { req }) => {
        if (req.errorImagen) throw new Error(req.errorImagen);
        return true;
    }),
];

export default productoValidator;
