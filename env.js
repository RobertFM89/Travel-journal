import 'dotenv/config.js'

const DB_USERNAME =process.env.DB_USERNAME
const DB_PASSWORD =process.env.DB_PASSWORD
const DB_HOST =process.env.DB_HOST
const DB_PORT =process.env.DB_PORT
const DB_DATABASE =process.env.DB_DATABASE
const JWT_SECRET =process.env.JWT_SECRET

export {
    DB_USERNAME,
    DB_PASSWORD,
    DB_HOST,
    DB_PORT,
    DB_DATABASE,
    JWT_SECRET
}