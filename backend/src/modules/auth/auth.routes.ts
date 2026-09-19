import { Router } from 'express';
import * as authController from './auth.controller';
import { validateRequest } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { authLimiter } from '../../middleware/rateLimiter.middleware';
import { registerSchema, loginSchema, refreshSchema, logoutSchema } from './auth.schema';

const router = Router();

router.post('/register', authLimiter, validateRequest(registerSchema), authController.register);
router.post('/login', authLimiter, validateRequest(loginSchema), authController.login);
router.post('/refresh', validateRequest(refreshSchema), authController.refresh);
router.post('/logout', validateRequest(logoutSchema), authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
