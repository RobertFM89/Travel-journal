import { confirmUserModel } from "../../models/users/index.js";

export default async function confirmUserController(req,res,next) {
    try {

        const token = req.query.token;

        if(!token) throw {
            status : 400,
            message : "Token inexistente",
            code : "BAD REQUEST"
        }

        const {message} = await confirmUserModel(token);

        return res.status(200).json({
            ok : true,
            message
        })
        
    } catch (error) {
        console.log(error);
        next(error)
    }
}