import nodemailer from 'nodemailer';
import env from '../config/env.js';
import { escaparHtml } from '../utils/formato.js';

const transporte = env.email.host
    ? nodemailer.createTransport({
          host: env.email.host,
          port: env.email.puerto,
          auth: { user: env.email.usuario, pass: env.email.password },
      })
    : null;

// Sin EMAIL_HOST el email no se envía: en desarrollo se muestra el enlace en consola
const enviar = async ({ para, asunto, html, enlace }) => {
    if (!transporte) {
        if (!env.esTest) console.info(`[email no enviado: falta EMAIL_HOST] ${asunto} -> ${para}: ${enlace}`);
        return;
    }
    await transporte.sendMail({ from: env.email.remitente, to: para, subject: asunto, text: enlace, html });
};

const plantilla = ({ saludo, cuerpo, enlace, textoEnlace, pie }) => `
    <p>${saludo}</p>
    <p>${cuerpo} <a href="${enlace}">${textoEnlace}</a></p>
    <p>${pie}</p>
`;

const emailConfirmarCuenta = ({ email, nombre, token }) => {
    const enlace = `${env.urlPublica}/auth/confirmar/${token}`;
    return enviar({
        para: email,
        asunto: `Confirma tu cuenta en ${env.nombreTienda}`,
        enlace,
        html: plantilla({
            saludo: `Hola ${escaparHtml(nombre)}, comprueba tu cuenta en ${env.nombreTienda}.`,
            cuerpo: 'Tu cuenta ya casi está lista, solo debes confirmarla en el siguiente enlace:',
            enlace,
            textoEnlace: 'Confirma tu cuenta',
            pie: 'Si no creaste esta cuenta, puedes ignorar el mensaje.',
        }),
    });
};

const emailRestablecerPassword = ({ email, nombre, token }) => {
    const enlace = `${env.urlPublica}/auth/olvide-password/${token}`;
    return enviar({
        para: email,
        asunto: `Restablece tu password en ${env.nombreTienda}`,
        enlace,
        html: plantilla({
            saludo: `Hola ${escaparHtml(nombre)}, has solicitado restablecer tu password en ${env.nombreTienda}.`,
            cuerpo: 'Sigue el siguiente enlace para generar un nuevo password:',
            enlace,
            textoEnlace: 'Restablecer password',
            pie: 'Si tú no solicitaste el cambio de password, puedes ignorar el mensaje.',
        }),
    });
};

// El envío no bloquea la respuesta; si falla se registra y la app sigue funcionando
const enviarEnSegundoPlano = (envio, descripcion) => {
    envio.catch((error) => console.error(`No se pudo enviar el email de ${descripcion}:`, error.message));
};

export { emailConfirmarCuenta, emailRestablecerPassword, enviarEnSegundoPlano };
