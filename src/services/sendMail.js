//importar nodemailer
import nodemailer from 'nodemailer';

//importar las variables de entorno
import {SMTP_HOST,SMTP_PORT,SMTP_USER,SMTP_PASS} from '../../env.js'

//crear el transporter y configuarlo
const transporter = nodemailer.createTransport({
    service: 'Brevo!!',
    host : SMTP_HOST,
    port: SMTP_PORT,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
    }
});

//crear la función que envía el mail
const sendMail = async (email, subject, body) => {
    try {

        await transporter.sendMail({
            from : SMTP_USER,
            to : email,
            subject,
            html : body
        });

        console.log("Email send!");
        
    } catch (error) {
        console.log(error);
    }
};

export default sendMail;