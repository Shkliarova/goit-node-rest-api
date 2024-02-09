import express from 'express';
import { register, login, logout, getCurrent } from '../controllers/authControllers.js';
import { validateBody } from '../helpers/validateBody.js';
import { registerSchema, loginSchema } from '../schemas/authValidationSchema.js';
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js';

export const authRouter = express.Router();

authRouter.post('/register', validateBody(registerSchema), register);
authRouter.post('/login', validateBody(loginSchema), login);
authRouter.post('/logout', authMiddleware, logout);
authRouter.get('/current', authMiddleware, getCurrent);