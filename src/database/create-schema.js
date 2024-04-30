import { DB_DATABASE } from "../../env.js";

export default async function createSchema(db) {
  try {

    console.log("Eliminando base de datos (si existe)...");
    await db.query(
      `DROP DATABASE IF EXISTS ${DB_DATABASE}`
    );

    console.log("Creando base de datos " + DB_DATABASE);
    await db.query(
      `CREATE DATABASE ${DB_DATABASE}`
    );
    await db.query(`USE ${DB_DATABASE}`)

    console.log("Creando tabla 'users'...")
    await db.query(`
    CREATE TABLE users (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        avatar VARCHAR(255) NULL,
        role ENUM('admin', 'normal') DEFAULT 'normal',
        token CHAR(30) NULL,
        active BOOLEAN DEFAULT false,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME ON UPDATE CURRENT_TIMESTAMP,
        deletedAt DATETIME NULL,
        PRIMARY KEY (id));
    `);

    console.log("Creando tabla 'posts'...")
    await db.query(`
    CREATE TABLE posts (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        userId INT UNSIGNED NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
          FOREIGN KEY (userId)
          REFERENCES users (id));
    `);

    console.log("Creando tabla 'votes'...")
    await db.query(`
    CREATE TABLE votes (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        postId INT UNSIGNED NOT NULL,
        userId INT UNSIGNED NOT NULL,
        vote TINYINT(1) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
          FOREIGN KEY (postId) REFERENCES posts (id),
          FOREIGN KEY (userId)
          REFERENCES users (id));
    `);

    console.log("Creando tabla 'comments'...")
    await db.query(`
    CREATE TABLE comments (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        message VARCHAR(500) NOT NULL,
        postId INT UNSIGNED NOT NULL,
        userId INT UNSIGNED NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
          FOREIGN KEY (postId) REFERENCES posts (id),
          FOREIGN KEY (userId) REFERENCES users (id));
    `);

    console.log("Creando tabla 'post_media'...")
    await db.query(`
    CREATE TABLE post_media (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        url VARCHAR(255) NOT NULL,
        mimeType VARCHAR(100) NOT NULL,
        postId INT UNSIGNED NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (postId) REFERENCES posts (id));
`);

    console.log("Creando tabla 'tags'...")
    await db.query(`
CREATE TABLE tags (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id));
`);

console.log("Creando tabla 'posts_tags'...")
    await db.query(`
CREATE TABLE posts_tags (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    postId INT UNSIGNED NOT NULL,
    tagId INT UNSIGNED NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (postId) REFERENCES posts (id),
    FOREIGN KEY (tagId) REFERENCES tags (id));
`);

    console.log('Tablas creadas con éxito!')

  } catch (error) {
    throw error
  }
};
