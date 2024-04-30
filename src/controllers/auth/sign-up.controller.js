import {request} from 'express';
import { signUpModel } from "../../models/auth/index.js";
import generateToken from "../../services/generateToken.js";
import sendMail from '../../services/sendMail.js';

export default async function signUpController(req = request,res,next) {
    try {
        const { username, email, password } = req.body;
    
        // Validar los datos
        if ([username, email, password].includes("" || undefined)) {
          let error = new Error("Todos los campos son requeridos");
          error.status = 400;
          throw error;
        }

        //generar token aleatorio (NO es un jwt) a los efectos de ser usado para terminar la registración
        const token = generateToken();

        //enviar al modelo la data para hacer la insersión en la base de datos
        const {message }= await signUpModel(username, email, password, token);

        //generar la data que se enviará por mail

        //asunto del mail
        const emailSubject = "Confirma tu registración en Journal Travel";

        //link para confirmar la registración
        const emailLink = `${req.protocol}://${req.get('host')}/users/confirm?token=${token}`;

        //cuerpo del mail
        const emailBody = `
          <!DOCTYPE html>
          <html lang="es">
          <body>
              <h2>Bienvenid@ ${username}</h2>
              <h4>¡Gracias por registrate en Travel Journal</h4>
              <hr>
              <p>Haz click en el siguiente <a href="${emailLink}">enlace</a> para confirmar tu registración</p>
          </body>
          </html>
        `
    
        await sendMail(email, emailSubject, emailBody);
    
        return res.status(201).json({
          ok: true,
          message,
        });
      } catch (error) {
        console.log(error);
        next(error);
      }
}
