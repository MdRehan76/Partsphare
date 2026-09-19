import { Router } from 'express';
import * as catalogController from './catalog.controller';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  listProductsQuerySchema,
  productSlugParamSchema,
  categorySlugParamSchema,
} from './catalog.schema';

const router = Router();

// Categories & Brands
router.get('/categories', catalogController.getCategoryTree);
router.get('/categories/:slug', validateRequest(categorySlugParamSchema), catalogController.getCategoryBySlug);
router.get('/brands', catalogController.listBrands);

// Products
router.get('/products', validateRequest(listProductsQuerySchema), catalogController.listProducts);
router.get('/products/:slug', validateRequest(productSlugParamSchema), catalogController.getProductBySlug);

export default router;
