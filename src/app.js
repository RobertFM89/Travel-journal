import express from 'express';
import getPool from './database/get-pool.js';

const app = express();
const PORT = process.env.PORT || 3000

const pool = await getPool();

//traer todas las publicaciones
app.get('/posts', async (req, res, next) => {
    try {
        const [posts] = await pool.query(`SELECT * FROM postos`)

        return res.status(200).json({
            ok: true,
            posts
        })

    } catch (error) {
        console.log(error)
        next(" Error en el get /posts " + error.message)
    }
})

app.listen(PORT, () => console.log( `Servidor corriendo en http://localhost:${PORT}`))