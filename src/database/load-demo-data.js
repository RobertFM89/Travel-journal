import { faker } from '@faker-js/faker';
import {hash} from 'bcrypt'
import { initialTags } from './initial-tags.js';

export default async function loadDemoData(db) {
    const userCount = 10;
    const users = [];
    const posts = [];

    for (let i = 3; i < userCount +3; i++) {
        
        /* generar usarios de demo */
        const userId = i
        const firstName = faker.person.firstName();
        const username = faker.internet.userName({firstName});
        const email = faker.internet.email({firstName});
        const password = await hash("123123", 10);
        const role = "normal";
        const avatar = "https://i.pravatar.cc/150?u=" + i;

        users.push({
            userId,
            username,
            email,
            password,
            role,
            avatar
        });

        console.log(`Cargando usuario demo (${i} de  ${userCount} :${username}`);
        await db.query(
            `INSERT INTO users(username, email, password, role, avatar) VALUES (?,?,?,?,?)`,
            [username, email, password, role, avatar]
        )

        /* por cada usuario generar los post de demo */
        const postsCount = Math.floor(Math.random() * 5) + 10;

        for (let p = 0; p < postsCount; p++) {

            const postId = posts.length + 1;
            const title = faker.lorem.sentence();
            const description = faker.lorem.paragraph();
            const createdAt = faker.date.recent({
                days : 30,
            });
            const updatedAt = Math.random() > 0.5 ? faker.date.recent({days : 10}) : null;

            posts.push({
                postId,
                title,
                description,
                createdAt,
                updatedAt
            });

            console.log(`Cargando posts demo (${p} de ${postsCount} del usuario: ${username}`);

            await db.query(
                `INSERT INTO posts(title, description, userId, createdAt, updatedAt) VALUES(?,?,?,?,?)`,
               [title,description,userId,createdAt, updatedAt] 
            )
        };

      
       

    };

    for (const post of posts) {
            
        /* generar fotos */
        const mediaCount = Math.floor(Math.random() * 3) + 1;

            for (let m = 0; m < mediaCount; m++) {
                const url = `https://picsum.photos/800/600?random=${post.postId}media${m + 1}`;
                const mimeType = "image/jpeg";

                console.log(`Cargando foto de demo ${m + 1} de ${mediaCount} del post ${post.postId}`);
                await db.query(
                    `INSERT INTO post_media(url, postId, mimeType) VALUES(?,?,?)`,
                    [url, post.postId, mimeType]
                )
                
            }

         /* generar comentarios */
         const commentsCount = Math.floor(Math.random() * 10) + 5;
            for (let c = 0; c < commentsCount; c++) {
                const message = faker.lorem.paragraph();
                const userId = Math.floor(Math.random() * userCount + 1);
                const createdAt = faker.date.soon({
                    days : 5,
                    refDate : post.createdAt,
                });
                const updatedAt = Math.random() > 0.5 ? faker.date.soon({days : 10, refDate : post.createdAt}) : null;

                console.log(`Cargando comentario de demo ${c + 1} de ${commentsCount} del post ${post.postId}`);
                await db.query(
                    `INSERT INTO comments(message, postId, userId, createdAt, updatedAt) VALUES(?,?,?,?,?)`,
                    [message, post.postId, userId, createdAt, updatedAt]
                )
            }

             /* generar votos */
         const votesCount = Math.floor(Math.random() * 10) + 10;

         for (let v = 0; v < votesCount; v++) {
             const vote = Math.random() > 0.2 ? 1 : -1
             const availableUsers = [...users];

             const randomIdex = Math.floor(Math.random() * availableUsers.length);

             const user = availableUsers[randomIdex];
             availableUsers.splice(randomIdex, 1);

             const createdAt = faker.date.soon({
                days : 5,
                refDate : post.createdAt,
            });

             console.log(`Cargando voto de demo ${v + 1} de ${votesCount} del post ${post.postId}`);
             await db.query(
                 `INSERT INTO votes(vote, postId, userId, createdAt) VALUES(?,?,?,?)`,
                 [vote, post.postId, user.userId, createdAt]
             )
         };

              /* generar tags */
              const tagsCount = Math.floor(Math.random() * 3) + 1;

              for (let t = 0; t < tagsCount; t++) {
                const availableTags = [...initialTags];

                  const randomIdex = Math.floor(Math.random() * availableTags.length);

                  const tag = availableTags[randomIdex];
                  availableTags.splice(randomIdex, 1);
     
                  console.log(`Cargando tag de demo ${t + 1} de ${tagsCount} del post ${post.postId}`);
                  await db.query(
                      `INSERT INTO posts_tags(postId, tagId) VALUES(?,?)`,
                      [post.postId, tag.id]
                  )
              }
    };



}