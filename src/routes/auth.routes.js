import express from 'express';
import { signInController, signUpController } from '../controllers/auth/index.js';

const router = express.Router();

/* /auth */
router
    .post("/sign-up",signUpController)
    .post("/sign-in",signInController)

export default router