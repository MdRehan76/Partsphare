import { z } from 'zod';
import { ProductCondition } from '@prisma/client';

export const listProductsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    categoryId: z.string().optional(),
    categorySlug: z.string().optional(),
    condition: z.nativeEnum(ProductCondition).optional(),
    brandId: z.string().optional(),
    brand: z.string().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    vehicleVariantId: z.string().optional(),
    compatibleOnly: z.string().optional(),
    sortBy: z.enum(['name', 'price', 'createdAt', 'rating']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const productSlugParamSchema = z.object({
  params: z.object({
    slug: z.string().min(1),
  }),
  query: z.object({
    variantId: z.string().optional(),
  }),
});

export const categorySlugParamSchema = z.object({
  params: z.object({
    slug: z.string().min(1),
  }),
});
