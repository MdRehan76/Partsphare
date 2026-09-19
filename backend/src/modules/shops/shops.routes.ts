import { Router, Request, Response, NextFunction } from 'express';
import * as shopsService from './shops.service';
import { successResponse } from '../../utils/response';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const city = req.query.city as string | undefined;
    const shops = await shopsService.listVerifiedShops(city);
    return successResponse(res, shops);
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shop = await shopsService.getShopBySlug(req.params.slug as string);
    return successResponse(res, shop);
  } catch (error) {
    next(error);
  }
});

export default router;
