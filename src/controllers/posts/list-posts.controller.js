import { listPostModel } from "../../models/posts/index.js"

export default async function listPostController (req, res ,next) {
    try {
        const {posts} = await listPostModel()


        return res.status(200).json({
            ok: true,
            posts
        })

    } catch (error) {
        console.log(error)
        next(" Error en el GET /posts " + error.message)
    }
}