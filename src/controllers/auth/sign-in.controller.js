import {hash} from 'bcrypt';
import getPool from "../../database/get-pool.js";

export default async function signUpModel(username, email, password, token) {
    try {

        const pool = await getPool()
    
        // Verificar que el usuario no esté registrado
        const [[user]] = await pool.query(
          `SELECT * FROM users WHERE username LIKE ? OR email LIKE ?`,
          [username, email]
        );
     
        if (user) throw {
            status : 400,
            message : "El nombre del usuario o el email ya está en uso",
            code : "BAD REQUEST"
        }
    
        // Hashear la contraseña
        const hashedPassword = await hash(password, 10);
    
        // Registrar al usuario
        await pool.query(
          `INSERT INTO users(username, email, password, token) VALUES(?,?,?,?)`,
          [username, email, hashedPassword, token]
        );
    
        return {
          message: "Te llegará un mail con el link para completar tu registración",
        };
      } catch (error) {
        throw error
      }
}