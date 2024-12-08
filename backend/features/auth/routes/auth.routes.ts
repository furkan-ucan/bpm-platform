import { type RequestHandler, Router } from 'express';

import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { User } from '../models/user.model';
import { validateLogin, validateRegister } from '../validators/auth.validator';

const router = Router();
const tokenService = new TokenService();
const authService = new AuthService(User, tokenService);
const authController = new AuthController(tokenService, authService);

// Bind methods and assert types for Express compatibility
const register = authController.register.bind(authController) as RequestHandler;
const login = authController.login.bind(authController) as RequestHandler;
const refreshToken = authController.refreshToken.bind(authController) as RequestHandler;
const logout = authController.logout.bind(authController) as RequestHandler;

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh-token', refreshToken);
router.get('/logout', authenticate, logout);

export const authRoutes = router;