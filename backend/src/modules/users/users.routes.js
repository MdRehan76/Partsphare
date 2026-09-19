const { Router } = require('express');
const { body } = require('express-validator');
const controller = require('./users.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Profile
router.get('/profile', controller.getProfile);
router.patch('/profile', [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
  body('phone').optional().isMobilePhone('en-IN'),
], validate, controller.updateProfile);

router.post('/change-password', [
  body('currentPassword').notEmpty().withMessage('Current password is required.'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and a number.'),
], validate, controller.changePassword);

// Addresses
router.get('/addresses', controller.getAddresses);
router.post('/addresses', [
  body('fullName').trim().notEmpty().withMessage('Full name is required.'),
  body('phone').isMobilePhone('en-IN').withMessage('Valid phone number required.'),
  body('line1').trim().notEmpty().withMessage('Address line 1 is required.'),
  body('city').trim().notEmpty().withMessage('City is required.'),
  body('state').trim().notEmpty().withMessage('State is required.'),
  body('pincode').matches(/^\d{6}$/).withMessage('Valid 6-digit pincode required.'),
], validate, controller.createAddress);

router.put('/addresses/:id', controller.updateAddress);
router.delete('/addresses/:id', controller.deleteAddress);
router.patch('/addresses/:id/default', controller.setDefaultAddress);

module.exports = router;
