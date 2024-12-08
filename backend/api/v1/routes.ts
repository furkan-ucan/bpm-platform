import { Router } from 'express';
import { authRoutes } from '@/features/auth/routes/auth.routes';
import { processRoutes } from '@/features/processes/routes/process.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/processes', processRoutes);

export default router; 