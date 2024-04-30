import express from 'express';
import path from 'path';
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
import upload from './middlewares/upload.js';
import crypto from "crypto";
import { postsRoutes, authRoutes, usersRoutes } from './routes/index.js';


const app = express();
const PORT = process.env.PORT || 3000
const PUBLIC_FOLDER = path.join(process.cwd(), "public")

const pool = await getPool();

app.use(express.json());

//recursos estaticos
app.use(express.static(PUBLIC_FOLDER))

//middleware que analiza el token y agrega al request los datos dle usuario
app.use(parseToken);

//enrutadores
app.use('/posts', postsRoutes) //rutas de publicaciones
app.use('/auth', authRoutes) //rutas de autentificaciones
app.use('/users', usersRoutes) //rutas de usuarios


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


//postear media
app.post('/posts/:idPost/media', checkUser, upload, async (req, res, next) => {

    try {
        
        //verificar el post
        const post = await verifyPost(req.params.idPost)

        //verificar el dueño
        const currentUser = req.currentUser
        verifyOwner(post, currentUser)

        //validar la cerga del archivo
        if(!req.files){
            throw{
                status: 400,
                message: "File not uploaded ",
                code: "BAD REQUEST"
            }
        }

        //recibir la imagen/video
        const myFile = req.files.media

        //validar si es una imagen o un video
        if(!myFile.mimetype.startsWith("image") && !myFile.mimetype.startsWith("video")){
            throw{
                status: 400,
                message: "The file is not an image neither a video",
                code: "BAD REQUEST"
            }
        }

         //extraer la extension del archivo
         const fileExt = path.extname(myFile.name)

         //extraer el mimeType
         const mimeType = myFile.mimetype

        //generar un nombre aleatorio
        const fileName = crypto.randomUUID();

        //generar la url que se guardara (post_media)
        const filePath = path.join('media', fileName + fileExt)
        const url = `${req.protocol}://${req.get('host')}/${filePath}`

        //guardamos los cambios en la base de datos
        await pool.query(`INSERT INTO post_media(url, mimeType, postId) 
        VALUES(?, ?, ?)`, [url, mimeType, post.id])

        //mover el archivo 
        await myFile.mv(path.join(PUBLIC_FOLDER, filePath))
        
        return res.status(201).json({
            ok: true,
            message: "File uploaded",
            url
        })

    } catch (error) {
       console.log(error)
       next(error) 
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

        return res.status(200).json({
            ok : true,
            message : "Post eliminated",
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

//votar
app.post('/posts/:idPost/votes/:voteType?', checkUser, async(req, res, next) => {

    try {
        
        const currentUser = req.currentUser;
        const post = await verifyPost(req.params.idPost);
        const voteType = req.params.voteType || "positive"
        const voteCurrent = voteType == "negative" ? -1 : 1

        const [[vote]] = await pool.query(`SELECT * FROM votes 
        WHERE postId = ? AND userId =?`, [post.id, currentUser.id])

        if(vote) {
            await pool.query(`UPDATE votes SET vote = ? 
            WHERE id  = ?`,[voteCurrent, vote.id])
        }else {
            await pool.query(`INSERT INTO votes (postId, userId, vote) VALUES (?, ?, ?)`, [post.id, currentUser.id, voteCurrent])
        }
        return res.status(201).json({
            ok: true,
            message: `The vote was  ${vote ? "modified" : "added"}`
        })

    } catch (error) {
        console.log(error)
        next(error)
    }
})

//eliminar el voto
app.delete('/posts/:idPost/votes', checkUser, async(req, res, next) =>{

    try {
        const currentUser = req.currentUser
        const post = await verifyPost(req.params.idPost)
        

        await pool.query(`DELETE FROM votes
        WHERE postId = ? AND userId = ?`, [post.id, currentUser.id])

        return res.status(200).json({
            ok: true,
            message: " The vote was deleted"
        })
        
    } catch (error) {
        console.log(error)
        next(error)
    }
})

app.use((req, res) => {
    return res.status(404).json({
        ok: false,
        message: "Endpoit not found"
    })
})

app.use((error, req, res, next) => {

    return res.status(error.status || 500).json({
        ok: false,
        message: error
    })
})

app.listen(PORT, () => console.log( `Servidor corriendo en http://localhost:${PORT}`))