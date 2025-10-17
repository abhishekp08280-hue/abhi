import { Router } from 'express';
import authRoutes from './authRoutes';
import profileRoutes from './profileRoutes';
import uploadRoutes from './uploadRoutes';
import jobRoutes from './jobRoutes';
import materialRoutes from './materialRoutes';
import sessionRoutes from './sessionRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/', profileRoutes);
router.use('/', uploadRoutes);
router.use('/', jobRoutes);
router.use('/', materialRoutes);
router.use('/', sessionRoutes);

export default router;
