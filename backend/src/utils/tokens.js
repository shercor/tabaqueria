import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';

// Sesión del usuario, guardada en la cookie _token
const generarJWT = ({ id, nombre }) => jwt.sign({ id, nombre }, env.jwtSecret, { expiresIn: '1d' });

const verificarJWT = (token) => jwt.verify(token, env.jwtSecret);

// Token de un solo uso (confirmar cuenta, recuperar password); debe ser impredecible
const generarTokenAleatorio = () => crypto.randomBytes(32).toString('hex');

export { generarJWT, verificarJWT, generarTokenAleatorio };
