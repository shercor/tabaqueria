import nodemailer from 'nodemailer'
import { escaparHtml } from './formato.js'

const crearTransporte = () => nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const urlBase = () => `${process.env.BACKEND_URL ?? 'http://localhost'}:${process.env.PORT ?? 3000}`;

const enviarEmail = opciones => crearTransporte().sendMail({
    from: process.env.EMAIL_FROM ?? 'Tabaquería <no-reply@tabaqueria.local>',
    ...opciones
});

const emailRegistro = ({ email, nombre, token }) => enviarEmail({
    to: email,
    subject: 'Confirma tu cuenta en la Tabaquería',
    text: `Confirma tu cuenta en: ${urlBase()}/auth/confirmar/${token}`,
    html: `
        <p>Hola ${escaparHtml(nombre)}, comprueba tu cuenta en la Tabaquería.</p>

        <p>Tu cuenta ya casi está lista, solo debes confirmarla en el siguiente enlace:
            <a href="${urlBase()}/auth/confirmar/${token}">Confirma tu cuenta</a>
        </p>

        <p>Si no creaste esta cuenta, puedes ignorar el mensaje.</p>
    `
});

const emailOlvidePassword = ({ email, nombre, token }) => enviarEmail({
    to: email,
    subject: 'Restablece tu password en la Tabaquería',
    text: `Restablece tu password en: ${urlBase()}/auth/olvide-password/${token}`,
    html: `
        <p>Hola ${escaparHtml(nombre)}, has solicitado restablecer tu password en la Tabaquería.</p>

        <p>Sigue el siguiente enlace para generar un nuevo password:
            <a href="${urlBase()}/auth/olvide-password/${token}">Restablecer password</a>
        </p>

        <p>Si tú no solicitaste el cambio de password, puedes ignorar el mensaje.</p>
    `
});

export {
    emailRegistro,
    emailOlvidePassword
}
