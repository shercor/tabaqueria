import crypto from 'crypto'
import jwt from 'jsonwebtoken'

// Token de autenticación de usuario
const generarJWT = datos => jwt.sign({ id: datos.id , nombre: datos.nombre } , process.env.JWT_SECRET , {expiresIn: '1d'})

// Token para confirmar cuenta y recuperar contraseña; debe ser impredecible
const generarId = () => crypto.randomBytes(32).toString('hex');

export {
    generarJWT,
    generarId
}
