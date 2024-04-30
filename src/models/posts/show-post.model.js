import getPool from "../../database/get-pool.js";


export default async function showPostModel(idPost) {
    try {
        
        const pool = await getPool();
        const [[post]] = await pool.query(`
        SELECT * FROM posts WHERE id = ?`,
        [idPost]
        )
        
        return {
          post
        };
    
      } catch (error) {
        throw error
      }
}