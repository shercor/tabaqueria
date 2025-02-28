import jwt from 'jsonwebtoken'

// Token de autenticación de usuario
const generarJWT = datos => jwt.sign({ id: datos.id , nombre: datos.nombre } , process.env.JWT_SECRET , {expiresIn: '1d'})

// Token para utilidades como recuperación de contraseña
const generarId = () => Math.random().toString(32).substring(2)  +  Date.now().toString(32);

export {
    generarJWT,
    generarId
}