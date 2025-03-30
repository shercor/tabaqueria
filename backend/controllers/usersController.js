import {check, validationResult} from 'express-validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Usuario from '../models/Usuario.js'
import {generarId, generarJWT} from '../helpers/tokens.js'
import { emailRegistro, emailOlvidePassword } from '../helpers/emails.js'

//Función de renderizado de formulario de Inicio de Sesión
const formularioLogin = (req, res) => {
    res.render('auth/login', {
        autenticado: true,
        pagina: 'Crear cuenta 2',
        texto: 'Inicia Sesion',
        csrfToken: req.csrfToken()
    })
}

const autenticar = async (req, res) => {
    // Validación
    await check('email').isEmail().withMessage('El email es obligatorio o su formato no es válido').run(req);
    await check('password').notEmpty().withMessage('El password es obligatorio').run(req);
    console.log('Autenticando...')

    let resultado = validationResult(req);

    // Verificar que el resultado esté vacío
    if(!resultado.isEmpty()){
        // Errores
        return res.render('auth/login' , {
            pagina: 'Iniciar Sesión',
            errores: resultado.array(),
            csrfToken: req.csrfToken(),
        })
    }

    const {email , password} = req.body

    // Comprobar si el usuario existe
    const usuario = await Usuario.findOne({where: { email}})
    if (!usuario){
        return res.render('auth/login' , {
            texto: 'Inicia Sesión',
            pagina: 'El usuario no existe',
            errores: [{msg: 'El usuario no existe'}],
            csrfToken: req.csrfToken(),
        })
    }

    // Comprobar si el usuario está confirmado
    if (!usuario.confirmado){
        return res.render( 'auth/login' , {
            texto: 'Inicia Sesión',
            pagina: 'El usuario no existe',
            errores: [{msg: 'Esta cuenta aún no ha sido confirmada'}],
            csrfToken: req.csrfToken(),
        })
    }

    // Revisar el password
    if (!usuario.verificarPassword(password)){
        return res.render( 'auth/login' , {
            texto: 'Inicia Sesión',
            pagina: 'El usuario no existe',
            errores: [{msg: 'El password es incorrecto'}],
        })
    }

    // Autenticar al usuario
    const token = generarJWT({id: usuario.id , nombre: usuario.nombre})

    // Almacenar en un cookie

    return res.cookie('_token' , token, {
        httpOnly : true, 
        //secure: true,
        //sameSite: true,
        }).redirect('/index')

    console.log(token);
}

const formularioRegistro = (req, res) => {
    
    console.log(req.csrfToken())

    res.render('auth/registro', {
        autenticado: true,
        texto: 'Crear cuenta',
        pagina: 'Registro',
        csrfToken: req.csrfToken()
    })
}

const logout = (req, res) => {
    // Se elimina el token de la cookie
    res.clearCookie('_token');

    // Redirigir al formulario de login
    return res.render( 'auth/login' , {
        texto: 'Inicia Sesión',
        pagina: 'El usuario no existe',
        csrfToken: req.csrfToken()
    })
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
    

    let resultado = validationResult(req);

    // Verificar que el resultado esté vacío
    if(!resultado.isEmpty()){
        // Errores
        return res.render('auth/registro' , {
            pagina: 'Crear cuenta',
            errores: resultado.array(),
            csrfToken: req.csrfToken(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    // Extraer los datos
    const { nombre, email, password} = req.body

    // Verificar que el usuario no esté duplicado
    // const existeUsuario = await Usuario.findOne( { where: { email }})
    const existeUsuario = await Usuario.findOne( { where: { email }})
    
    if(existeUsuario){
        return res.render('auth/registro' , {
            pagina: 'Crear cuenta',
            errores: [{msg: 'El usuario ya se encuentra registrado'}],
            csrfToken: req.csrfToken(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    } 
    // Almacenar un usuario
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    });

    // Se envía email de confirmación
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })

    // Se redirige a vista de correo enviado

    res.render('templates/mensaje' , {
        texto: 'Cuenta creada correctamente',
        mensaje: 'Hemos enviado un email de Confirmación, presiona en el enlace'
    })
    //res.json(usuario)
}

const formularioOlvidePassword = (req, res) => {

    res.render('auth/olvide-password', {
        autenticado: true,
        texto: 'Recupera tu Password',
        pagina: 'Registro',
        csrfToken: req.csrfToken()
    })
}

const resetPassword = async (req, res) =>  {
        // Validación
        await check('email').isEmail().withMessage('El email ingresado no es válido').run(req);
        
    
        let resultado = validationResult(req);
    
        // Verificar que el resultado esté vacío
        if(!resultado.isEmpty()){
            // Errores
            return res.render('auth/olvide-password' , {
                errores: resultado.array(),
                csrfToken: req.csrfToken(),
                texto: 'Recupera tu Password',
                pagina: 'Registro',
                csrfToken: req.csrfToken()

            })
        }

        // Buscar el usuario
        const {email} = req.body

        const usuario = await Usuario.findOne({where : {email}})

        if (!usuario) {
            return res.render('auth/olvide-password' , {
                errores: [{msg: 'El email no pertenece a ningún usuario'}],
                csrfToken: req.csrfToken(),
                texto: 'Recupera tu Password',
                pagina: 'Registro',
                csrfToken: req.csrfToken()
            })
        }

        // Generar un token y enviar el email
        usuario.token = generarId();
        await usuario.save();

        // Enviar un email
        emailOlvidePassword({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token,
        })

        //Renderizar un mensaje
        res.render('templates/mensaje' , {
            pagina: 'Reestablece tu Password',
            mensaje: 'Hemos enviado un con las instrucciones'
        })
        
        console.log(usuario);
        console.log('Final')

}

// Función que valida la confirmación de una cuenta

const confirmar = async (req, res, next) => {
    console.log('Hola')
    const {token} = req.params
    console.log(token);

    //Verificar si el token es válido
    const usuario = await Usuario.findOne({where: {token}})

    if (!usuario) {
        return res.render('auth/confirmar-cuenta', {
            texto: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta',
            error: true
        })
    } else {
        console.log(usuario);
        usuario.token = null;
        usuario.confirmado = true;
        await usuario.save();

        return res.render('auth/confirmar-cuenta', {
            texto: 'Usuario verificado',
            mensaje: 'La cuenta se ha podido verificar exitosamente',
            error: false
        })
    }

    // Confirmar la cuenta


    next();

}

const comprobarToken = async (req, res) => {
    const {token} = req.params
    const usuario =  await Usuario.findOne({where: {token}})

    if (!usuario) {
        return res.render('auth/confirmar-cuenta', {
            texto: 'Reestablece tu Password',
            mensaje: 'Hubo un error al validar tu información. Intenta otra vez.',
            error: true
        })
    }

    // Mostrar formulario para modificar el password
    res.render('auth/reset-password' , {
        pagina: 'Reestablece tu password',
        csrfToken: req.csrfToken()
    })
    console.log(usuario);

    
}

const nuevoPassword = async (req, res) => {
    // Validar el nuevo password

    await check('password').isLength({min: 6 }).withMessage('El password debe ser de al menos 6 caracteres').run(req);

    // Identificar quién hace el cambio

    let resultado = validationResult(req);

    // Verificar que el resultado esté vacío
    if(!resultado.isEmpty()){
        // Errores
        return res.render('auth/reset-password' , {
            pagina: 'Reestablece tu password',
            errores: resultado.array(),
            csrfToken: req.csrfToken(),
        })
    }

    const {token} =req.params
    const {password} = req.body

    // Identificar el usuario
    const usuario = await Usuario.findOne({where: {token}})
    console.log(usuario);

    // Hashear el nuevo password
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash( usuario.password , salt);
    usuario.token = null;

    await usuario.save();

    res.render('auth/confirmar-cuenta' , {
        pagina: 'Password Reestablecido',
        mensaje: 'El password se guardó correctamente'
    })
}

const showUserInfo = (req , res) => {
    if (!req.usuario){
        res.json({response : 'No se ha iniciado sesión con ningún usuario'})
    } else {
        res.json({usuario: req.usuario})
    }
}

// const obtenerUsuarioActual = (req, res) => {
//     const usuario = req.usuario;
//     if (!usuario) {
//         return res.status(401).json({ error: 'No se ha iniciado sesión con ningún usuario' });
//     }
//     res.json(usuario);
// }

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