import { Router } from 'express';
import * as ordersController from './orders.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', ordersController.listOrders);
router.post('/checkout-quote', ordersController.getCheckoutQuote);
router.get('/:id', ordersController.getOrder);
router.post('/', ordersController.createOrder);

export default router;
