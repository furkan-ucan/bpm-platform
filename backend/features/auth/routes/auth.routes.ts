import { Router } from 'express';

import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { AuthService } from '../services/auth.service';
import { validateLogin, validateRegister } from '../validators/auth.validator';

const router = Router();
const authService = new AuthService();
const authController = new AuthController(authService);

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);

export const authRoutes = router; 