const { Router } = require('express');
const { body } = require('express-validator');
const controller = require('./vehicles.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');

const router = Router();

// Public — master vehicle data
router.get('/makes', controller.getMakes);
router.get('/makes/:makeId/models', controller.getModels);
router.get('/models/:modelId/variants', controller.getVariants);

// Protected — My Garage
router.get('/garage', authenticate, controller.getMyGarage);

router.post('/garage', authenticate, [
  body('variantId').notEmpty().withMessage('Variant ID is required.'),
  body('nickname').optional().trim().isLength({ max: 50 }),
  body('regNumber').optional().trim().isLength({ max: 20 }),
  body('isPrimary').optional().isBoolean(),
], validate, controller.addVehicle);

router.patch('/garage/:id', authenticate, controller.updateVehicle);
router.delete('/garage/:id', authenticate, controller.removeVehicle);

module.exports = router;
