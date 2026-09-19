import { Router } from 'express';
import * as cartController from './cart.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);
router.patch('/items/:id', cartController.updateItem);
router.delete('/items/:id', cartController.removeItem);
router.delete('/clear', cartController.clear);
router.post('/revalidate', cartController.revalidate);
router.post('/simulate-inventory-update', cartController.simulateInventoryUpdate);

export default router;
