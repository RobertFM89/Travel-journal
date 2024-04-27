import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../env.js';

export default function parseToken(req, res, next) {
    try {
        const token = req.headers.authorization;
        const currentUser = jwt.verify(token, JWT_SECRET)

        req.currentUser = currentUser;
        
    } catch (error) {
        //console.log("Error parse-token " + error.message)
    }
    finally {
        next()
    }
}