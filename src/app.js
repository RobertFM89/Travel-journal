import express from 'express';
import getPool from './database/get-pool.js';
import { compare, hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../env.js';
import parseToken from './middlewares/parse-token.js';
import checkUser from './middlewares/check-user.js';
import validateCreatePost from './validations/validate-create-post.js';
import verifyOwner from './validations/verify-owner.js';
import verifyPost from './validations/verify-post.js';
import validateCreateComment from './validations/validate-create-comment.js';
import verifyComment from './validations/verify-comment.js';


const app = express();
const PORT = process.env.PORT || 3000

const pool = await getPool();

app.use(express.json());

app.use(parseToken);

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

//traer una publicacion
app.get('/posts/:idPost', async(req, res, next) => {
    try {
        const post = await verifyPost(req.params.idPost)

        return res.status(200).json({
            ok: true,
            post
        })
    } catch (error) {
        console.log(error);
        next(error);
    }
})

//crear publicacion 
app.post('/posts',checkUser, async(req, res, next) => {
    try {
        const currentUser = req.currentUser;

        //validar los datos
        const {title, description} = validateCreatePost(req.body)

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
        next("El error esta en el POST /posts" + error.message)
    }
})

//actualizar una publicacion
app.patch('/posts/:idPost', checkUser, async(req, res, next) => {
    try {

        const currentUser = req.currentUser
        const post = await verifyPost(req.params.idPost)
        // const [[post]] = await pool.query(`SELECT * FROM posts WHERE id = ?`, [id])

        // if(!post){
        //     throw {
        //         status: 404,
        //         message: "Post not found",
        //         code: "NOT FOUND"
        //     }
        // }

        verifyOwner(post, currentUser)
        
        const {title = post.title, description = post.description} = req.body;

        const [response] = await pool.query(`UPDATE posts SET title = ?, description = ?
        WHERE id = ?`, [title, description, post.id])

        return res.status(200).json({
            ok: true,
            message: response.changedRows ? "Post updated": "No changes at all",
            post: {
                id: post.insertId
            }
        })

    } catch (error) {
        console.log(error)
        next("El error esta en el PATCH /posts " + error.message)
    }
})

//eliminar un post
app.delete('/posts/:idPost', checkUser, async(req, res, next) => {
    try {

        const currentUser = req.currentUser;

        const post = await  verifyPost(req.params.idPost)

        verifyOwner(post, currentUser)

        const response = await pool.query(`DELETE FROM posts WHERE id = ?`, [post.id])

        console.log(response)

        return res.status(200).json({
            ok : true,
            message : "Publicacion borrada con exito",
        })
        
    } catch (error) {
        console.log(error)
        next("El error esta en el DELETE /posts " + error.message)
    }
})

//agregar un comentario
app.post('/posts/:idPost/comments', checkUser, async (req, res, next) => {
    try {
        const post = await verifyPost(req.params.idPost)
        const currentUser = req.currentUser;
        const {message} = validateCreateComment(req.body)

        const [comment] = await pool.query(`INSERT INTO comments(message, postId, userId)
        VALUES(?,?,?)`, [message, post.id, currentUser.id])

        return res.status(201).json({
            ok: true,
            message:  "Comment added succesfully",
            comment: {
                id: comment.insertId
            }
        })

    } catch (error) {
        console.log(error)
        next(error.message)
    }
})

//editar un comentario

app.patch('/posts/:idPost/comments/:idComment', checkUser, async (req, res, next) => {
    try {
        const {message} = validateCreateComment(req.body)

        const currentUser = req.currentUser;
    
        const comment = await verifyComment(req.params.idComment)

        verifyOwner(comment, currentUser)

        const [response] = await pool.query(`UPDATE comments SET message = ? 
        WHERE id = ?`, [message, comment.id])

        return res.status(200).json({
            ok: true,
            message: response.changedRows ? "Comment updated" : "No changes"
        })

    } catch (error) {
        console.log(error)
        next(error)
        
    }
})

//eliminar un comentario
app.delete('/posts/:idPost/comments/:idComment', checkUser, async(req, res, next) => {
    try {
        const currentUser = req.currentUser
        const comment = await verifyComment(req.params.idComment)
        verifyOwner(comment, currentUser)
        
        await pool.query(`DELETE FROM comments
         WHERE id = ?`, [comment.id])

        return res.status(200).json({
            ok: true,
            message: "Comment erased"
        }) 

    } catch (error) {
        console.log(error)
        next(error)
    }
})


app.use((error, req, res, next) => {

    return res.status(error.status || 500).json({
        ok: false,
        message: error
    })
})

app.listen(PORT, () => console.log( `Servidor corriendo en http://localhost:${PORT}`))