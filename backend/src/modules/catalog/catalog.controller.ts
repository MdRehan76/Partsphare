import { Request, Response, NextFunction } from 'express';
import * as categoriesService from './categories.service';
import * as productsService from './products.service';
import { successResponse } from '../../utils/response';
import { ProductCondition } from '@prisma/client';

export const getCategoryTree = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tree = await categoriesService.getCategoryTree();
    return successResponse(res, tree);
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params.slug as string;
    const category = await categoriesService.getCategoryBySlug(slug);
    return successResponse(res, category);
  } catch (error) {
    next(error);
  }
};

export const listProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page,
      limit,
      search,
      categoryId,
      categorySlug,
      condition,
      brandId,
      brand,
      minPrice,
      maxPrice,
      vehicleVariantId,
      compatibleOnly,
      sortBy,
      sortOrder,
    } = req.query as any;

    const result = await productsService.listProducts({
      page,
      limit,
      search,
      categoryId,
      categorySlug,
      condition: condition as ProductCondition,
      brandId,
      brand,
      minPrice,
      maxPrice,
      vehicleVariantId,
      compatibleOnly,
      sortBy,
      sortOrder,
    });

    return successResponse(res, result.products, 'Products retrieved successfully.', 200, result.meta);
  } catch (error) {
    next(error);
  }
};

export const listBrands = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const brands = await productsService.listBrands();
    return successResponse(res, brands, 'Brands retrieved successfully.');
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params.slug as string;
    const { variantId } = req.query as { variantId?: string };
    const product = await productsService.getProductBySlug(slug, variantId);
    return successResponse(res, product);
  } catch (error) {
    next(error);
  }
};
