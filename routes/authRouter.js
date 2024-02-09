import express from 'express';
import { register, login, logout, getCurrent } from '../controllers/authControllers';
import { validateBody } from '../helpers/validateBody';
import { registerSchema, loginSchema } from '../schemas/authValidationSchema';
import { authMiddleware } from '../controllers/middlewares/authMiddleware';

export const authRouter = express.Router();

authRouter.post('/register', validateBody(registerSchema), register);
authRouter.post('/login', validateBody(loginSchema), login);
authRouter.post('/logout', authMiddleware, logout);
authRouter.get('/current', authMiddleware, getCurrent);