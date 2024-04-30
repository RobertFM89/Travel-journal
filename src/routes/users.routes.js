import express from 'express';
import { confirmUserController } from '../controllers/users/index.js';

const router = express.Router();

/* /users */
router
    .get("/confirm",confirmUserController)

export default router