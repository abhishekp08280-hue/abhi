import { Router } from 'express';
import { body } from 'express-validator';
import { register, verifyOtp, login, refresh, logout } from '../controllers/authController';

const router = Router();

router.post(
  '/register',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['teacher', 'institution']),
  register
);

router.post('/verify-otp', body('email').isEmail(), body('otp').isLength({ min: 4, max: 8 }), verifyOtp);
router.post('/login', body('email').isEmail(), body('password').isLength({ min: 6 }), login);
router.post('/refresh', body('refreshToken').isString(), refresh);
router.post('/logout', body('refreshToken').isString(), logout);

export default router;
