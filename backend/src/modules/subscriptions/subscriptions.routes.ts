import { Router, Request, Response, NextFunction } from 'express';
import * as subService from './subscriptions.service';
import { successResponse } from '../../utils/response';
import { authenticate } from '../../middleware/auth.middleware';
import { AuthenticatedRequest } from '../../types';

const router = Router();

router.get('/plans', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = await subService.listActivePlans();
    return successResponse(res, plans);
  } catch (error) {
    next(error);
  }
});

router.get('/my', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const subscription = await subService.getUserSubscription(req.user!.id);
    return successResponse(res, subscription);
  } catch (error) {
    next(error);
  }
});

export default router;
