import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth';
import { createSession, getSession } from '../controllers/sessionController';

const router = Router();

router.post(
  '/sessions',
  requireAuth(['teacher', 'institution']),
  body('title').isString(),
  body('startTime').isISO8601(),
  body('duration').isInt({ min: 1 }),
  createSession
);

router.get('/sessions/:id', getSession);

export default router;
