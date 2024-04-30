import getPool from "../../database/get-pool.js"

export default async function confirmUserModel(token) {
    try {
        
        const pool = await getPool();

        const [[user]]= await pool.query(`
        SELECT *  FROM users WHERE token = ?`,
        [token])

        if(!user) throw {
            status : 400,
            message : "Token not valid",
            code : "BAD REQUEST"
        }

        await pool.query(`
        UPDATE users SET token = ?, active = ? WHERE token = ?`,
        [null, true, token])


        return {
            message : "Registro confirmado con éxito"
        }


    } catch (error) {
        throw error
    }
}