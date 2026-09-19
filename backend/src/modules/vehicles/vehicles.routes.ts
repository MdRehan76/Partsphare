import { Router } from 'express';
import * as vehiclesController from './vehicles.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  getMakesQuerySchema,
  addVehicleSchema,
  updateVehicleSchema,
  vehicleIdParamSchema,
} from './vehicles.schema';

const router = Router();

// Public routes — Master vehicle data
router.get('/makes', validateRequest(getMakesQuerySchema), vehiclesController.getMakes);
router.get('/makes/:makeId/models', vehiclesController.getModels);
router.get('/models/:modelId/variants', vehiclesController.getVariants);

// Protected routes — Customer's My Garage
router.get('/garage', authenticate, vehiclesController.getMyGarage);
router.post('/garage', authenticate, validateRequest(addVehicleSchema), vehiclesController.addVehicle);
router.put('/garage/:id', authenticate, validateRequest(updateVehicleSchema), vehiclesController.updateVehicle);
router.patch('/garage/:id/primary', authenticate, validateRequest(vehicleIdParamSchema), vehiclesController.setPrimaryVehicle);
router.delete('/garage/:id', authenticate, validateRequest(vehicleIdParamSchema), vehiclesController.removeVehicle);

export default router;
