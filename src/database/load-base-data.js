import {hash} from 'bcrypt'
import {initialTags} from './initial-tags.js';
import {ADMIN_EMAIL, ADMIN_PASSWORD} from '../../env.js';


export default async function loadBaseData(db) {
    /* USUARIOS INICIALES */
    console.log('Cargando usuarios iniciales...');
    const users = [
        {
            username : "admin",
            email : ADMIN_EMAIL,
            password : await hash(String(ADMIN_PASSWORD), 10),
            role : "admin",
            active : true,
            avatar : "https://i.pravatar.cc/150?u=" + 1,
        },
        {
            username : "user",
            email : "user@gmail.com",
            password : await hash("123123", 10),
            role : "normal",
            active : true,
            avatar : "https://i.pravatar.cc/150?u=" + 2,
        }
    ];

    for (const user of users) {
        console.log("Cargando usuario " + user.username) + '...';
        await db.query(
            `INSERT INTO users(username, email, password, role, active, avatar) VALUES(?,?,?,?,?,?)`,
            [user.username, user.email, user.password, user.role, user.active, user.avatar]
        )
    }
    console.log('Usuarios inciales cargados con éxito...');

    /* TAGS INCIALES */
    console.log('Cargando tags iniciales...');

    for (const tag of initialTags) {
        console.log('Cargando tag ' + tag + '...');

        await db.query(
            `INSERT INTO tags(name) VALUES(?)`,
            [tag.name]
        )
    }
    console.log('Tags inciales cargados con éxito...');

}