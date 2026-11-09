import {check, validationResult} from 'express-validator'
import Usuario from '../models/Usuario.js'
import {generarId, generarJWT} from '../helpers/tokens.js'
import { emailRegistro, emailOlvidePassword } from '../helpers/emails.js'

// El envío no bloquea la respuesta; si falla se registra y la app sigue funcionando
const enviarSinBloquear = (envio, descripcion) =>
    envio.catch(error => console.error(`No se pudo enviar el email de ${descripcion}:`, error.message));

const vistaLogin = (res, errores) => res.render('auth/login', {
    pagina: 'Iniciar Sesión',
    texto: 'Inicia Sesión',
    errores
});

//Función de renderizado de formulario de Inicio de Sesión
const formularioLogin = (req, res) => vistaLogin(res);

const autenticar = async (req, res) => {
    // Validación
    await check('email').isEmail().withMessage('El email es obligatorio o su formato no es válido').run(req);
    await check('password').notEmpty().withMessage('El password es obligatorio').run(req);

    const resultado = validationResult(req);
    if(!resultado.isEmpty()){
        return vistaLogin(res, resultado.array());
    }

    const {email , password} = req.body

    // Comprobar si el usuario existe
    const usuario = await Usuario.findOne({where: { email}})
    if (!usuario){
        return vistaLogin(res, [{msg: 'El usuario no existe'}]);
    }

    // Comprobar si el usuario está confirmado
    if (!usuario.confirmado){
        return vistaLogin(res, [{msg: 'Esta cuenta aún no ha sido confirmada'}]);
    }

    // Revisar el password
    if (!usuario.verificarPassword(password)){
        return vistaLogin(res, [{msg: 'El password es incorrecto'}]);
    }

    // Autenticar al usuario y almacenar el token en una cookie
    const token = generarJWT({id: usuario.id , nombre: usuario.nombre})

    return res.cookie('_token' , token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    }).redirect('/index')
}

const vistaRegistro = (res, errores, usuario) => res.render('auth/registro', {
    pagina: 'Crear cuenta',
    texto: 'Crear cuenta',
    errores,
    usuario
});

const formularioRegistro = (req, res) => vistaRegistro(res);

const logout = (req, res) => {
    res.clearCookie('_token');
    return res.redirect('/auth/login');
}

const registrar = async (req, res) => {
    // Validación
    await check('nombre').notEmpty().withMessage('El nombre es obligatorio').run(req);
    await check('email').isEmail().withMessage('El email ingresado no es válido').run(req);
    await check('password').isLength({min: 6 }).withMessage('El password debe ser de al menos 6 caracteres').run(req);
    await check('repeat-password')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Las contraseñas no coinciden');
            }
            return true;
        })
        .run(req);

    const { nombre, email, password} = req.body
    const datosIngresados = { nombre, email };

    const resultado = validationResult(req);
    if(!resultado.isEmpty()){
        return vistaRegistro(res, resultado.array(), datosIngresados);
    }

    // Verificar que el usuario no esté duplicado
    const existeUsuario = await Usuario.findOne( { where: { email }})
    if(existeUsuario){
        return vistaRegistro(res, [{msg: 'El usuario ya se encuentra registrado'}], datosIngresados);
    }

    // Almacenar un usuario
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    });

    enviarSinBloquear(emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    }), 'confirmación');

    res.render('templates/mensaje' , {
        pagina: 'Cuenta creada',
        texto: 'Cuenta creada correctamente',
        mensaje: 'Hemos enviado un email de confirmación, presiona en el enlace'
    })
}

const vistaOlvidePassword = (res, errores) => res.render('auth/olvide-password', {
    pagina: 'Recupera tu Password',
    texto: 'Recupera tu Password',
    errores
});

const formularioOlvidePassword = (req, res) => vistaOlvidePassword(res);

const resetPassword = async (req, res) =>  {
    await check('email').isEmail().withMessage('El email ingresado no es válido').run(req);

    const resultado = validationResult(req);
    if(!resultado.isEmpty()){
        return vistaOlvidePassword(res, resultado.array());
    }

    // Buscar el usuario
    const {email} = req.body
    const usuario = await Usuario.findOne({where : {email}})

    if (!usuario) {
        return vistaOlvidePassword(res, [{msg: 'El email no pertenece a ningún usuario'}]);
    }

    // Generar un token y enviar el email
    usuario.token = generarId();
    await usuario.save();

    enviarSinBloquear(emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token,
    }), 'recuperación de password');

    res.render('templates/mensaje' , {
        pagina: 'Restablece tu Password',
        texto: 'Revisa tu correo',
        mensaje: 'Hemos enviado un email con las instrucciones'
    })
}

// Función que valida la confirmación de una cuenta
const confirmar = async (req, res) => {
    const {token} = req.params
    const usuario = await Usuario.findOne({where: {token}})

    if (!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Confirmar cuenta',
            texto: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta',
            error: true
        })
    }

    usuario.token = null;
    usuario.confirmado = true;
    await usuario.save();

    return res.render('auth/confirmar-cuenta', {
        pagina: 'Confirmar cuenta',
        texto: 'Usuario verificado',
        mensaje: 'La cuenta se ha podido verificar exitosamente',
        error: false
    })
}

const tokenInvalido = res => res.render('auth/confirmar-cuenta', {
    pagina: 'Restablece tu Password',
    texto: 'Restablece tu Password',
    mensaje: 'Hubo un error al validar tu información. Intenta otra vez.',
    error: true
});

const vistaResetPassword = (res, errores) => res.render('auth/reset-password', {
    pagina: 'Restablece tu password',
    texto: 'Restablece tu password',
    errores
});

const comprobarToken = async (req, res) => {
    const usuario = await Usuario.findOne({where: {token: req.params.token}})
    if (!usuario) return tokenInvalido(res);

    // Mostrar formulario para modificar el password
    vistaResetPassword(res);
}

const nuevoPassword = async (req, res) => {
    const usuario = await Usuario.findOne({where: {token: req.params.token}})
    if (!usuario) return tokenInvalido(res);

    await check('password').isLength({min: 6 }).withMessage('El password debe ser de al menos 6 caracteres').run(req);

    const resultado = validationResult(req);
    if(!resultado.isEmpty()){
        return vistaResetPassword(res, resultado.array());
    }

    // El hook beforeSave del modelo hashea el password nuevo
    usuario.password = req.body.password;
    usuario.token = null;
    await usuario.save();

    res.render('auth/confirmar-cuenta' , {
        pagina: 'Password Restablecido',
        texto: 'Password restablecido',
        mensaje: 'El password se guardó correctamente',
        error: false
    })
}

const showUserInfo = (req , res) => {
    if (!req.usuario){
        res.json({response : 'No se ha iniciado sesión con ningún usuario'})
    } else {
        res.json({usuario: req.usuario})
    }
}

export {
    formularioLogin,
    autenticar,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword,
    resetPassword,
    comprobarToken,
    nuevoPassword,
    logout,
    showUserInfo
}
