import getPool from "../database/get-pool.js"

const pool = await getPool()

export default async function verifyPost(id) {
    try {
        const [[post]] = await pool.query(`SELECT * FROM posts WHERE id = ?`, [id])

        if(!post){
            throw {
                status: 404,
                message: "Post not found",
                code: "NOT FOUND"
            }
        }
        return post
        
    } catch (error) {
        throw error
    }
}