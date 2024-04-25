import getPool from "./get-pool.js";

const createTables = async () => {
    try {
        
        const pool = await getPool()

        await pool.query(`DROP TABLE IF EXISTS 
        post_tags, tags, users, posts, votes, roles, post_media, comments`)
        console.log('Removing tables...')

        await pool.query(`CREATE TABLE users 
        (id INT UNSIGNED NOT NULL AUTO_INCREMENT,
             username VARCHAR(100) UNIQUE NOT NULL, 
             email VARCHAR(255) UNIQUE NOT NULL, 
             password VARCHAR(255) NOT NULL, 
             avatar VARCHAR(255) NULL, 
             isActive TINYINT(1) DEFAULT 0, 
             token VARCHAR(100) NULL, 
             role ENUM('admin', 'normal') DEFAULT 'normal', 
             createdAt DATETIME NULL, updatedAt DATETIME NULL, 
             deletedAt DATETIME NULL, PRIMARY KEY (id))`)

        await pool.query(`CREATE TABLE posts (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            userId INT UNSIGNED NOT NULL,
            isVisible TINYINT(1) DEFAULT 0,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            FOREIGN KEY (userId) REFERENCES users (id))`)   
            
        await pool.query(`CREATE TABLE votes (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            postId INT UNSIGNED NOT NULL,
            userId INT UNSIGNED NOT NULL,
            vote TINYINT(1) NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
              FOREIGN KEY (postId) REFERENCES posts (id),
              FOREIGN KEY (userId) REFERENCES users (id))`)
              
        await pool.query(`CREATE TABLE comments (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            message VARCHAR(500) NOT NULL,
            postId INT UNSIGNED NOT NULL,
            userId INT UNSIGNED NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
              FOREIGN KEY (postId) REFERENCES posts (id),
              FOREIGN KEY (userId) REFERENCES users (id))`)
              
        await pool.query(`CREATE TABLE post_media (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            url VARCHAR(255) NOT NULL,
            postId INT UNSIGNED NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            FOREIGN KEY (postId) REFERENCES posts (id))`)
            
        await pool.query(`CREATE TABLE tags (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id))`)
            
        await pool.query(`CREATE TABLE posts_tags (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            postId INT UNSIGNED NOT NULL,
            tagId INT UNSIGNED NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            FOREIGN KEY (postId) REFERENCES posts (id),
            FOREIGN KEY (tagId) REFERENCES tags (id))`)
            
    console.log("Tables created")
    
    process.exit(0)

    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

createTables()