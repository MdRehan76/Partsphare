import { Router } from 'express';
import * as paymentsController from './payments.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Public webhook route (signature verified in controller/service)
router.post('/webhook', paymentsController.handleWebhook);

// Protected routes
router.use(authenticate);

router.post('/create-order', paymentsController.createPaymentOrder);
router.post('/verify', paymentsController.verifyPayment);
router.post('/fail', paymentsController.recordPaymentFailure);
router.post('/retry/:orderId', paymentsController.retryPayment);
router.get('/status/:orderId', paymentsController.getPaymentStatus);
router.patch('/switch-method/:orderId', paymentsController.switchPaymentMethod);

export default router;
