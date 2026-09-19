const { Router } = require('express');
const controller = require('./auth.controller');
const { registerValidators, loginValidators, refreshValidators } = require('./auth.validators');
const validate = require('../../middleware/validate.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const { authLimiter } = require('../../middleware/rateLimiter.middleware');

const router = Router();

// POST /api/auth/register
router.post('/register', authLimiter, registerValidators, validate, controller.register);

// POST /api/auth/login
router.post('/login', authLimiter, loginValidators, validate, controller.login);

// POST /api/auth/refresh
router.post('/refresh', refreshValidators, validate, controller.refresh);

// POST /api/auth/logout
router.post('/logout', controller.logout);

// GET /api/auth/me  [protected]
router.get('/me', authenticate, controller.getMe);

module.exports = router;
