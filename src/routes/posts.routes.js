import express from 'express';
import {listPostController, showPostController} from '../controllers/posts/index.js';

const router = express.Router()


//posts
router
    .get('/', listPostController)
    .get('/:idPost', showPostController)

export default router