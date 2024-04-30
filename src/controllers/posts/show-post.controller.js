
import showPostModel from "../../models/posts/show-post.model.js";
import verifyPost from "../../validations/verify-post.js";


export default async function showPostController(req,res,next) {
    try {

        const idPost = req.params.idPost
       
        await verifyPost(idPost);

        const {post}= await showPostModel(idPost)
    
        return res.status(200).json({
          ok: true,
          post,
        });
    
      } catch (error) {
        console.log(error);
        next(error);
      }
}
