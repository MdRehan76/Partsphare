import { Router } from 'express';
import * as usersController from './users.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  updateProfileSchema,
  changePasswordSchema,
  createAddressSchema,
  updateAddressSchema,
  addressIdParamSchema,
} from './users.schema';

const router = Router();

router.use(authenticate);

router.get('/profile', usersController.getProfile);
router.put('/profile', validateRequest(updateProfileSchema), usersController.updateProfile);
router.post('/change-password', validateRequest(changePasswordSchema), usersController.changePassword);

router.get('/addresses', usersController.getAddresses);
router.post('/addresses', validateRequest(createAddressSchema), usersController.createAddress);
router.put('/addresses/:id', validateRequest(updateAddressSchema), usersController.updateAddress);
router.delete('/addresses/:id', validateRequest(addressIdParamSchema), usersController.deleteAddress);
router.patch('/addresses/:id/default', validateRequest(addressIdParamSchema), usersController.setDefaultAddress);

export default router;
