import * as authService from '../services/authService.js';
import env from '../config/env.js';
import { COOKIE_SESION } from '../middlewares/auth.js';
import { erroresDeFormulario } from '../middlewares/validacion.js';
import { ErrorNegocio } from '../utils/errores.js';

// Vuelve a mostrar el formulario si la validación falló o el servicio rechazó los datos.
// Las funciones mostrar* reciben (req, res, errores) y no se usan directo como handlers de ruta
const conFormulario = (mostrar, accion) => async (req, res) => {
    const errores = erroresDeFormulario(req);
    if (errores) return mostrar(req, res, errores);

    try {
        return await accion(req, res);
    } catch (error) {
        if (error instanceof ErrorNegocio) return mostrar(req, res, [{ msg: error.message }]);
        throw error;
    }
};

const mensaje = (res, { pagina, titulo, mensaje, error = false, enlace }) =>
    res.render('mensaje', { pagina, titulo, mensaje, error, enlace });

const enlaceLogin = { href: '/auth/login', texto: 'Ya puedes iniciar sesión' };

// --- Login y logout ---

const mostrarLogin = (req, res, errores) => res.render('auth/login', { pagina: 'Iniciar Sesión', errores });

const formularioLogin = (req, res) => mostrarLogin(req, res);

const login = conFormulario(mostrarLogin, async (req, res) => {
    const token = await authService.iniciarSesion(req.body.email, req.body.password);
    res.cookie(COOKIE_SESION, token, { httpOnly: true, sameSite: 'lax', secure: env.esProduccion });
    res.redirect('/index');
});

const logout = (req, res) => {
    res.clearCookie(COOKIE_SESION);
    res.redirect('/auth/login');
};

// --- Registro y confirmación ---

const mostrarRegistro = (req, res, errores) =>
    res.render('auth/registro', {
        pagina: 'Crear cuenta',
        errores,
        usuario: { nombre: req.body?.nombre, email: req.body?.email },
    });

const formularioRegistro = (req, res) => mostrarRegistro(req, res);

const registrar = conFormulario(mostrarRegistro, async (req, res) => {
    await authService.registrar(req.body);
    mensaje(res, {
        pagina: 'Cuenta creada',
        titulo: 'Cuenta creada correctamente',
        mensaje: 'Hemos enviado un email de confirmación, presiona en el enlace',
    });
});

const confirmar = async (req, res) => {
    const confirmada = await authService.confirmarCuenta(req.params.token);
    mensaje(res, {
        pagina: 'Confirmar cuenta',
        titulo: confirmada ? 'Usuario verificado' : 'Error al confirmar tu cuenta',
        mensaje: confirmada ? 'La cuenta se ha podido verificar exitosamente' : 'Hubo un error al confirmar tu cuenta',
        error: !confirmada,
        enlace: confirmada ? enlaceLogin : undefined,
    });
};

// --- Recuperar password ---

const mostrarOlvidePassword = (req, res, errores) =>
    res.render('auth/olvide-password', { pagina: 'Recupera tu Password', errores });

const formularioOlvidePassword = (req, res) => mostrarOlvidePassword(req, res);

const olvidePassword = conFormulario(mostrarOlvidePassword, async (req, res) => {
    await authService.solicitarCambioPassword(req.body.email);
    mensaje(res, {
        pagina: 'Restablece tu Password',
        titulo: 'Revisa tu correo',
        mensaje: 'Hemos enviado un email con las instrucciones',
    });
});

const tokenInvalido = (res) =>
    mensaje(res, {
        pagina: 'Restablece tu Password',
        titulo: 'Restablece tu Password',
        mensaje: 'Hubo un error al validar tu información. Intenta otra vez.',
        error: true,
    });

const mostrarNuevoPassword = (req, res, errores) =>
    res.render('auth/reset-password', { pagina: 'Restablece tu password', errores });

const formularioNuevoPassword = async (req, res) => {
    if (!(await authService.tokenDePasswordValido(req.params.token))) return tokenInvalido(res);
    mostrarNuevoPassword(req, res);
};

const nuevoPassword = conFormulario(mostrarNuevoPassword, async (req, res) => {
    if (!(await authService.cambiarPassword(req.params.token, req.body.password))) return tokenInvalido(res);
    mensaje(res, {
        pagina: 'Password restablecido',
        titulo: 'Password restablecido',
        mensaje: 'El password se guardó correctamente',
        enlace: enlaceLogin,
    });
});

export {
    formularioLogin,
    login,
    logout,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword,
    olvidePassword,
    formularioNuevoPassword,
    nuevoPassword,
};
