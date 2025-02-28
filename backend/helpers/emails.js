import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config({path: '.env'})

const emailRegistro = async (datos) => {
    console.log(process.env.EMAIL_HOST + process.env.EMAIL_PORT + process.env.EMAIL_USER + process.env.EMAIL_PASS);
    var transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      console.log(datos);

      const {email, nombre, token} = datos;

      // Enviar el email
      await transport.sendMail({
        from: 'noreply.bienesraices.com',
        to: email,
        subject: 'Confirma tu cuenta en BienesRaices.com',
        text: 'Confirma tu cuenta',
        html: `
            <p>Hola ${nombre}, comprueba tu cuenta en bienesRaices.com </p>

            <p>Tu cuenta ya casi está lista, solo debes confirmarla en el siguiente enlace:
                <a href="${process.env.BACKEND_URL}:${process.env.port ?? 3000}/auth/confirmar/${token}"> Confirma tu cuenta</a>
            </p>

            <p> Si no creaste esta cuenta, puedes ignorar el mensaje</p>
        `
      })
}

const emailOlvidePassword = async (datos) => {
  console.log(process.env.EMAIL_HOST + process.env.EMAIL_PORT + process.env.EMAIL_USER + process.env.EMAIL_PASS);
  var transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    console.log(datos);

    const {email, nombre, token} = datos;

    // Enviar el email
    await transport.sendMail({
      from: 'noreply.bienesraices.com',
      to: email,
      subject: 'Restablece tu Password en BienesRaices.com',
      text: 'Restablece tu Password en BienesRaices.com',
      html: `
          <p>Hola ${nombre}, has solicitado reestablecer tu password en bienesRaices.com </p>

          <p>Sigue el siguiente enlace para generar un nuevo password:
              <a href="${process.env.BACKEND_URL}:${process.env.port ?? 3000}/auth/olvide-password/${token}"> Reestablecer password</a>
          </p>

          <p> Si tú no solicitaste el cambio de password, puedes ignorar el mensaje</p>
      `
    })
}


export {
    emailRegistro,
    emailOlvidePassword
}