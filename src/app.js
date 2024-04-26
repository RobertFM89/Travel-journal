import express from 'express';
import getPool from './database/get-pool.js';
import { compare, hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../env.js';

const app = express();
const PORT = process.env.PORT || 3000

const pool = await getPool();

app.use(express.json());

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
        WHERE username LIKE ? OR email LIKE ?`, [username, email])
        // const response = pool.query(consulta...) -> [[{},{}],[]]
        // const [posicionCero] = pool.query(consulta...) -> [[{}]]
        // const [elemento] = pool.query(consulta...) -> {}

        if(user) {
            let error = new Error("The username or the e-mail is already registered")
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
        next("El error esta en el POST /sign-up " + error.message)
    }
})

//loguear a un usuario registrado
app.post('/sign-in', async (req, res, next) => {
    try {
        const {email, password} = req.body;
        //validar los datos
        if([email, password].includes("" || undefined)){
            let error = new Error("All fields are required");
            error.status = 400;
            throw error;
        }
        //verificar que el email este registrado
        const [[user]] = await pool.query(`SELECT * FROM users WHERE email LIKE ?`, [email]);

        if(!user){
            let error = new Error("Invalid credential [email]")
            error.status = 400;
            throw error;
        }

        //verificar (comparar) la contraseña con la que esta guardada
        const isValidPassword = await compare(password, user.password);

        if(!isValidPassword){
            let error = new Error("Invalid credential [password]");
            error.status = 400;
            throw error;
        }

        //generar un JWT (token) y lo enviamos como respuesta
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email
            },
            JWT_SECRET,
            {
                expiresIn: "7d"
            }
        )

        return res.status(200).json({
            ok: true,
            token
        })
        
    } catch (error) {
        console.log(error);
        next("El error esta en el POST /sign-in " + error.message)
        
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
        next(" Error en el GET /posts " + error.message)
    }
})

//crear publicacion
app.post('/posts', async(req, res, next) => {
    try {
        const token = req.headers.authorization;
        const currentUser = jwt.verify(token, JWT_SECRET)

        console.log(currentUser)

        const {title, description} = req.body;

        //validar los datos
        if([title, description].includes("" || undefined)){
            let error = new Error("All fields are required");
            error.status = 400;
            throw error;
        }

        const [post] = await pool.query(`INSERT INTO posts(title, description, userId) 
        VALUES (?, ?, ?)`,[title, description, currentUser.id])

        return res.status(201).json({
            ok: true,
            message: "Publicacion creada con exito",
            post : {
                id : post.insertId
            }
        })


    } catch (error) {
        console.log(error)
        next("El error esta en el POST /posts")
    }
})

app.use((error, req, res, next) => {

    return res.status(error.status || 500).json({
        ok: false,
        message: error
    })
})

app.listen(PORT, () => console.log( `Servidor corriendo en http://localhost:${PORT}`))