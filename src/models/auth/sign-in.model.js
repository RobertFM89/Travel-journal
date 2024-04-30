import { JWT_SECRET } from '../../../env.js';

import {compare} from 'bcrypt';
import jwt from 'jsonwebtoken';
import getPool from "../../database/get-pool.js";

export default async function signInModel(email, password) {
    try {
    
        const pool = await getPool()
        // verificar que email esté registrado
        const [[user]] = await pool.query(
          `SELECT * FROM users WHERE email LIKE ?`,
          [email]
        );
    
        if (!user) throw {
            status : 400,
            message : "Credenciales inválidas [email]", //!no es bueno dar info del error
            code : "BAD REQUEST"
        }
         
        // verificar (comparar) la contraseña con la que está guardada
        const isValidPassword = await compare(password, user.password);
    
        if (!isValidPassword) throw {
            status : 400,
            message : "Credenciales inválidas [Password]", //!no es bueno dar info del error
            code : "BAD REQUEST"
        }
    
        // generar un JWT (token) y lo enviamos como respuesta
        const token = jwt.sign(
          {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
          },
          JWT_SECRET,
          {
            expiresIn: "7d",
          }
        );
    
        return {
          token
        };
      } catch (error) {
       throw error
      }
}