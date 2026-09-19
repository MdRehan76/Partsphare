import { Router, Request, Response, NextFunction } from 'express';
import * as usedPartsService from './usedparts.service';
import { successResponse, createdResponse } from '../../utils/response';
import { authenticate } from '../../middleware/auth.middleware';
import { AuthenticatedRequest } from '../../types';

const router = Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const listings = await usedPartsService.listVerifiedUsedParts();
    return successResponse(res, listings);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const listing = await usedPartsService.createUsedPartListing(req.user!.id, req.body);
    return createdResponse(res, listing, 'Used part listing submitted for verification.');
  } catch (error) {
    next(error);
  }
});

export default router;
