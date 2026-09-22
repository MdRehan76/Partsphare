import { Router } from 'express';
import * as subController from './subscriptions.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/plans', subController.listPlans);
router.get('/plans/:id', subController.getPlanDetails);

// Protected routes (require customer authentication)
router.use(authenticate);

router.get('/my', subController.getMySubscriptions);
router.get('/my/active', subController.getMyActiveSubscription);
router.post('/subscribe', subController.subscribeToPlan);
router.post('/verify-payment', subController.verifySubscriptionPayment);
router.post('/:id/cancel', subController.cancelSubscription);
router.patch('/:id/cancel', subController.cancelSubscription);
router.patch('/:id/auto-renew', subController.toggleAutoRenew);
router.post('/:id/renew', subController.renewSubscription);
router.post('/:id/expire', subController.expireSubscription);
router.post('/:id/use-entitlement', subController.useEntitlement);
router.post('/:id/entitlements/use', subController.useEntitlement);

export default router;
