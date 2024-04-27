export default function validateCreateComment({message}) {
    if ([message].includes("" || undefined)) {
        throw {
            message: "All fields are required",
            status : 400,
            code : "BAD REQUEST"
        }
      };

      return {
        message
      }
}