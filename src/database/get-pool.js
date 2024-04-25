import {createPool} from 'mysql2/promise.js'
import {DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT, DB_DATABASE} from '../../env.js'

let pool;

const getPool = async () => {
    try {
        if(!pool){
            pool = createPool({
                user : DB_USERNAME,
                password : DB_PASSWORD,
                host : DB_HOST,
                port : DB_PORT
            });
            await pool.query(`CREATE DATABASE IF NOT EXISTS ${DB_DATABASE}`)

            pool = createPool({
                user : DB_USERNAME,
                password : DB_PASSWORD,
                host : DB_HOST,
                port : DB_PORT,
                database : DB_DATABASE
            });
            console.log("Established connection")
            return pool
        }
       

    } catch (error) {
        console.log(error)
    }
}

export default getPool;