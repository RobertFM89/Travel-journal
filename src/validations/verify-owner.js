export default function verifyOwner(post, currentUser){
    if(post.userId != currentUser.id) {
        throw {
            status : 403,
            message : "No estas acreditado",
            code : "UNAUTHORIZED"
        }
    }

}