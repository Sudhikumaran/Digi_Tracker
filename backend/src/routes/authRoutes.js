const { Router } = require('express');
const authController = require('../controllers/authController');
const { validate, schemas } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: 'Too many attempts' } });

const router = Router();

router.post('/register', authLimiter, validate(schemas.register), authController.register);
router.post('/login', authLimiter, validate(schemas.login), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.post('/forgot-password', authLimiter, validate(schemas.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validate(schemas.resetPassword), authController.resetPassword);

module.exports = router;
