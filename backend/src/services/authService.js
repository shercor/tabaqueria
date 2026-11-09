import { Usuario } from '../models/index.js';
import { ErrorNegocio } from '../utils/errores.js';
import { generarJWT, generarTokenAleatorio } from '../utils/tokens.js';
import { emailConfirmarCuenta, emailRestablecerPassword, enviarEnSegundoPlano } from './emailService.js';

// Devuelve el JWT de sesión si las credenciales son válidas
const iniciarSesion = async (email, password) => {
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) throw new ErrorNegocio('El usuario no existe');
    if (!usuario.confirmado) throw new ErrorNegocio('Esta cuenta aún no ha sido confirmada');
    if (!(await usuario.verificarPassword(password))) throw new ErrorNegocio('El password es incorrecto');

    return generarJWT(usuario);
};

const registrar = async ({ nombre, email, password }) => {
    if (await Usuario.findOne({ where: { email } })) {
        throw new ErrorNegocio('El usuario ya se encuentra registrado');
    }

    const usuario = await Usuario.create({ nombre, email, password, token: generarTokenAleatorio() });
    enviarEnSegundoPlano(emailConfirmarCuenta(usuario), 'confirmación');
};

// Devuelve false si el token no corresponde a ninguna cuenta
const confirmarCuenta = async (token) => {
    const usuario = await Usuario.findOne({ where: { token } });
    if (!usuario) return false;

    await usuario.update({ token: null, confirmado: true });
    return true;
};

const solicitarCambioPassword = async (email) => {
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) throw new ErrorNegocio('El email no pertenece a ningún usuario');

    await usuario.update({ token: generarTokenAleatorio() });
    enviarEnSegundoPlano(emailRestablecerPassword(usuario), 'recuperación de password');
};

const tokenDePasswordValido = async (token) => Boolean(await Usuario.findOne({ where: { token } }));

// El hook beforeSave del modelo hashea el password nuevo
const cambiarPassword = async (token, password) => {
    const usuario = await Usuario.findOne({ where: { token } });
    if (!usuario) return false;

    await usuario.update({ password, token: null });
    return true;
};

export {
    iniciarSesion,
    registrar,
    confirmarCuenta,
    solicitarCambioPassword,
    tokenDePasswordValido,
    cambiarPassword,
};
