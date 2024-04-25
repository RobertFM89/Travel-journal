import express from 'express';
import getPool from './database/get-pool.js';
import { hash } from 'bcrypt';

const app = express();
const PORT = process.env.PORT || 3000

const pool = await getPool();

//registrar a un usuario anonimo
app.post('/sign-up', async (req, res, next) => {
    try {
        const {username, email, password} = req.body;
        //validar los datos
        if([username, email, password].includes("" || undefined)) {
            let error = new Error ("All fields are required")
            error.status = 400;
            throw error;
        }
        //verificar que el usuario no este ya registrado
        const [[user]] = await pool.query(`SELECT * FROM users 
        WHERE usename LIKE ? OR email LIKE ?`, [username, email])
        // const response = pool.query(consulta...) -> [[{},{}],[]]
        // const [posicionCero] = pool.query(consulta...) -> [[{}]]
        // const [elemento] = pool.query(consulta...) -> {}

        if(user) {
            let error = new Error("This user is already registered")
            error.status = 400;
            throw error;
        }
        //hashear la contraseña
        const hashedPassword = await hash(password, 10)

        //registrar al usuario
        await pool.query(`INSERT INTO users (username, email, password)
        VALUES (?, ?, ?)`, [username, email, hashedPassword])

        //TODO: enviar confirmacion por email 
        
        return res.status(201).json ({
            ok: true,
            message: "Te llegara un email con un link para completar la registracion"
        })

    } catch (error) {
        console.log(error)
        next("El error esta en el /sign-up " + error.message)
    }
})


//traer todas las publicaciones
app.get('/posts', async (req, res, next) => {
    try {
        const [posts] = await pool.query(`SELECT * FROM posts`)

        return res.status(200).json({
            ok: true,
            posts
        })

    } catch (error) {
        console.log(error)
        next(" Error en el get /posts " + error.message)
    }
})

app.use((error, req, res, next) => {

    return res.status(error.status || 500).json({
        ok: false,
        message: error
    })
})

app.listen(PORT, () => console.log( `Servidor corriendo en http://localhost:${PORT}`))