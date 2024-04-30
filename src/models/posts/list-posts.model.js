import getPool from "../../database/get-pool.js"

export default async function listPostModel(params) {
    try {
        const pool = await getPool()

        const [posts] = await pool.query(`SELECT * FROM posts`)

        

        return {
            posts
        }

    } catch(error){
        throw error
    }
}