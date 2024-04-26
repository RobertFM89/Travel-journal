export default function validateCreatePost ({title, description}) {
    if([title, description].includes("" || undefined)){
        // let error = new Error ("Todos los campos son requeridos");
        // error.status = 400;
        // throw error;
        throw {
            message: "All fields are required",
            status: 400,
            code: "BAD REQUEST"
        }
    }
    return {
        title,
        description,
    }
}