# Guia para enviar email desde una API

## Dependencias

*Nodemailer* es una biblioteca para Node.js que permite enviar correos electrónicos de manera sencilla. Es especialmente útil cuando se desea enviar correos electrónicos desde una aplicación basada en Node.js, como las que utilizan el marco Express.

Necesitaremos un servicio SMTP (Simple Mail Transfer Protocol). El SMTP es esencialmente el protocolo que permite que los correos electrónicos se envíen de un servidor a otro. En esta documentación, elegimos *Brevo* como proveedor de SMTP, para los emails transaccionales. Brevo es conocido por ofrecer un servicio SMTP confiable, y además cuenta con una opción gratuita, perfecta para quienes están iniciando o para proyectos con requerimientos moderados.

## Brevo

### Creación de una cuenta en Brevo

1. Ir al sitio web oficial de Brevo: <https://onboarding.brevo.com/account/register>
2. Llenar los campos solicitados: correo electrónico, contraseña, etc.
3. Hacer clic en "Inscribirme" o "Sign Up".
4. Confirmar tu dirección de correo electrónico haciendo clic en el enlace enviado a tu bandeja de entrada.
5. Una vez confirmada la cuenta, ingresar y seguir los pasos del asistente de configuración.

### Obtención de las credenciales SMTP

1. Una vez logueado en Brevo, acceder al menú desplegable ubicado en la esquina superior derecha y selecciona "SMTP & API".
2. Seleccionar la pestaña "SMTP".
3. Aquí, encontrarás tus credenciales SMTP: servidor (generalmente smtp-relay.sendinblue.com), puerto, y detalles de inicio de sesión (correo electrónico y contraseña/API key) que debes tener a mano para configurar el transporter en nodemailer.

![alt text](image.png)

## Nodemailer

### Cómo usar nodemailer con Express

Para comenzar a usar nodemailer en tu aplicación Express, instala la biblioteca a través de npm:

~~~js
npm install nodemailer
~~~

Un "transportador" (transporter) es esencialmente el método que nodemailer utiliza para enviar correos electrónicos. Puedes configurarlo para usar SMTP, servicios en la nube o incluso enviar correos a través de un servicio local.

Ahora que ya dispones de la cuenta SMTP y con los datos a mano puedes ya configurar tu transporter:

~~~~js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'sendinblue',
    port: 587, // Puedes usar 465 para SSL
    auth: {
        user: 'tucorreo@gmail.com',
        pass: 'tucontraseñaMaestraBrevo'
    }
});
~~~~

### Envío de correos

Una vez que tengas configurado el transportador, puedes usar el método sendMail para enviar un correo:

~~~~js
let mailOptions = {
    from: 'tucorreo@gmail.com',
    to: 'destinatario@gmail.com',
    subject: 'Prueba de Nodemailer',
    text: '¡Hola! Este es un correo de prueba enviado desde nodemailer.'
};

const sendMail = async () => {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado: ' + info.response);
  } catch (err) {
    console.error(err);
  }
};

sendMail();
~~~~

Puedes proporcionar varios correos electrónicos en el campo to separándolos con comas.

~~~~js
let mailOptions = {
    from: 'tuCorreo@ejemplo.com',
    to: 'destinatario1@gmail.com, destinatario2@gmail.com, destinatario3@gmail.com',
    subject: 'Prueba con SendinBlue',
    text: '¡Hola! Este es un correo de prueba enviado desde nodemailer usando SendinBlue.'
};
~~~~

Si tienes los correos electrónicos en un array, puedes unirlos en una cadena separada por comas para usarla en el campo to.

~~~~js
const destinatarios = ['destinatario1@gmail.com', 'destinatario2@gmail.com', 'destinatario3@gmail.com'];

let mailOptions = {
    from: 'tuCorreo@ejemplo.com',
    to: destinatarios.join(', '),
    subject: 'Prueba con SendinBlue',
    text: '¡Hola! Este es un correo de prueba enviado desde nodemailer usando SendinBlue.'
};
~~~~

### Ejemplo de integración con Express

Para enviar un correo electrónico desde una aplicación Express, simplemente integra todo el código anterior:

~~~~js
import express from 'express';
import nodemailer from 'nodemailer';

const app = express();

// Configuración del transportador.
const transporter = nodemailer.createTransport({
    service: 'sendinblue',
    port: 587, // Puedes usar 465 para SSL
    auth: {
        // Dirección de correo asociada a la cuenta de Brevo
        user: 'tucorreo@gmail.com',
        // Contraseña maestra que se encuentra en sección SMTP y API
        pass: 'tucontraseñaMaestraBrevo'
    }
});

// Middleware que envía un email.
app.post('/send-email', async (req, res, next) => {
    try {
        await transporter.sendMail({
            from: 'tucorreo@gmail.com',
            to: 'destinatario@gmail.com',
            subject: 'Prueba de Nodemailer',
            text: '¡Hola! Este es un correo de prueba enviado desde nodemailer.'
        });

        res.send({
            status: 'ok',
            message: 'Email enviado'
        });
    } catch (err) {
        next(err);
    }
});

// Middleware de manejo de errores...

// Middleware de ruta no encontrada...

app.listen(8000, () => {
    console.log('El servidor está escuchando en http://localhost:8000');
});
~~~~

### Consideraciones importantes

- **Seguridad**: No expongas tus credenciales directamente en el código. Utiliza variables de entorno o algún paquete como dotenv para mantener tus credenciales seguras.
- **HTML en correos**: nodemailer también admite el envío de correos en formato HTML. Simplemente utiliza la propiedad html en lugar de text en las opciones del correo (*mailOptions*).
- Si envías correos a un gran número de destinatarios, podrías alcanzar los límites de envío de tu proveedor SMTP o incluso ser considerado como un *spammer*, por lo que siempre es bueno tener precaución y conocer los límites y políticas de tu proveedor de servicios SMTP.