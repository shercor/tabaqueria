import { body } from 'express-validator';

const email = () => body('email').trim().isEmail().withMessage('El email ingresado no es válido');
const passwordNuevo = () =>
    body('password').isLength({ min: 6 }).withMessage('El password debe ser de al menos 6 caracteres');

const loginValidator = [
    body('email').trim().isEmail().withMessage('El email es obligatorio o su formato no es válido'),
    body('password').notEmpty().withMessage('El password es obligatorio'),
];

const registroValidator = [
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
    email(),
    passwordNuevo(),
    body('repeat-password')
        .custom((valor, { req }) => valor === req.body.password)
        .withMessage('Las contraseñas no coinciden'),
];

const olvidePasswordValidator = [email()];

const nuevoPasswordValidator = [passwordNuevo()];

export { loginValidator, registroValidator, olvidePasswordValidator, nuevoPasswordValidator };
