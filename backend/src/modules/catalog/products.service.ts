import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';
import { slugify, paginate, paginationMeta } from '../../utils/helpers';
import { ProductCondition } from '@prisma/client';

export const listProducts = async ({
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
}: {
  page?: string;
  limit?: string;
  search?: string;
  categoryId?: string;
  categorySlug?: string;
  condition?: ProductCondition;
  brandId?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  vehicleVariantId?: string;
  compatibleOnly?: string | boolean;
  sortBy?: string;
  sortOrder?: string;
}) => {
  const { skip, take } = paginate(page, limit);

  // Resolve category by slug if needed
  let resolvedCategoryId = categoryId;
  if (!resolvedCategoryId && categorySlug) {
    const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (cat) resolvedCategoryId = cat.id;
  }

  // Resolve brand by slug/name if needed
  let resolvedBrandId = brandId;
  if (!resolvedBrandId && brand) {
    const b = await prisma.brand.findUnique({ where: { slug: brand } });
    if (b) resolvedBrandId = b.id;
  }

  const isCompatibleOnly = compatibleOnly === 'true' || compatibleOnly === true;

  const priceFilter: any = {};
  if (minPrice) priceFilter.gte = parseFloat(minPrice);
  if (maxPrice) priceFilter.lte = parseFloat(maxPrice);

  const where: any = {
    status: 'ACTIVE',
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { partNumber: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } },
      ],
    }),
    ...(resolvedCategoryId && { categoryId: resolvedCategoryId }),
    ...(condition && { condition }),
    ...(resolvedBrandId && { brandId: resolvedBrandId }),
    ...(vehicleVariantId && isCompatibleOnly && {
      compatibilities: { some: { variantId: vehicleVariantId } },
    }),
    ...(Object.keys(priceFilter).length > 0
      ? {
          inventories: {
            some: {
              sellingPrice: priceFilter,
            },
          },
        }
      : {}),
  };

  const validSortFields: Record<string, string> = {
    name: 'name',
    price: 'basePrice',
    createdAt: 'createdAt',
    rating: 'rating',
  };
  const orderField = validSortFields[sortBy || ''] || 'createdAt';
  const orderDir = sortOrder === 'asc' ? 'asc' : 'desc';

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: { [orderField]: orderDir as any },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: { select: { id: true, name: true, slug: true } },
        brandRel: { select: { id: true, name: true, slug: true, logoUrl: true } },
        inventories: {
          include: {
            shop: { select: { id: true, name: true, city: true, rating: true, isVerified: true } },
          },
          orderBy: { sellingPrice: 'asc' },
        },
        compatibilities: {
          include: {
            variant: {
              include: { model: { include: { make: true } } },
            },
          },
        },
        _count: { select: { reviews: true, compatibilities: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const { page: p, limit: l } = paginate(page, limit);

  return {
    products: products.map((prod: any) => formatProductList(prod, vehicleVariantId)),
    meta: paginationMeta(total, p, l),
  };
};

export const getProductBySlug = async (slugOrId: string, variantId?: string) => {
  // Support both slug and ID lookup
  let product = await prisma.product.findUnique({
    where: { slug: slugOrId },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      category: true,
      brandRel: true,
      specifications: { orderBy: { sortOrder: 'asc' } },
      inventories: {
        include: {
          shop: { select: { id: true, name: true, city: true, rating: true, isVerified: true } },
        },
        orderBy: { sellingPrice: 'asc' },
      },
      compatibilities: {
        include: {
          variant: {
            include: { model: { include: { make: true } } },
          },
        },
      },
      reviews: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { reviews: true } },
    },
  });

  if (!product) {
    product = await prisma.product.findUnique({
      where: { id: slugOrId },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: true,
        brandRel: true,
        specifications: { orderBy: { sortOrder: 'asc' } },
        inventories: {
          include: {
            shop: { select: { id: true, name: true, city: true, rating: true, isVerified: true } },
          },
          orderBy: { sellingPrice: 'asc' },
        },
        compatibilities: {
          include: {
            variant: {
              include: { model: { include: { make: true } } },
            },
          },
        },
        reviews: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { reviews: true } },
      },
    });
  }

  if (!product) throw AppError.notFound('Product not found.');
  if (product.status !== 'ACTIVE') throw AppError.notFound('This product is not currently available.');

  let isCompatible: boolean | null = null;
  if (variantId && product.compatibilities) {
    isCompatible = product.compatibilities.some(
      (c: any) => c.variantId === variantId || c.variant?.id === variantId
    );
  }

  return { ...formatProductDetail(product), isCompatible };
};

export const listBrands = async () => {
  return prisma.brand.findMany({
    orderBy: { name: 'asc' },
  });
};

export const getProductById = async (id: string) => {
  return getProductBySlug(id);
};

export const createProduct = async (data: any) => {
  const slug = data.slug || slugify(data.name);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) throw AppError.conflict(`Product slug "${slug}" already exists.`);

  const sku = data.sku || `PS-${Date.now()}`;

  return prisma.product.create({
    data: { ...data, slug, sku },
    include: { images: true, category: true },
  });
};

export const updateProduct = async (id: string, data: any) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw AppError.notFound('Product not found.');

  return prisma.product.update({
    where: { id },
    data,
    include: { images: true, category: true },
  });
};

const formatProductList = (p: any, vehicleVariantId?: string) => {
  let isCompatible: boolean | null = null;
  if (vehicleVariantId) {
    const list = p.compatibilities || [];
    isCompatible = list.some(
      (c: any) => c.variantId === vehicleVariantId || c.variant?.id === vehicleVariantId
    );
  }

  const inventories = p.inventories || [];
  const lowestPrice = inventories[0] ? Number(inventories[0].sellingPrice) : Number(p.basePrice);
  const isAvailable = inventories.some((inv: any) => inv.isAvailable && inv.quantity > 0);
  const stockQuantity = inventories.reduce((acc: number, inv: any) => acc + (inv.quantity || 0), 0);

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brandRel?.name || p.brand,
    brandLogo: p.brandRel?.logoUrl || null,
    partNumber: p.partNumber || p.sku || 'N/A',
    condition: p.condition,
    basePrice: Number(p.basePrice),
    mrp: Number(p.mrp),
    lowestPrice,
    primaryImage: p.images && p.images[0] ? p.images[0].url : null,
    images: p.images || [],
    category: p.category,
    rating: p.rating || 4.5,
    reviewCount: p._count?.reviews ?? p.reviews?.length ?? 0,
    isAvailable,
    stockQuantity,
    warranty: p.warranty || '6 Months Warranty',
    isCompatible,
    compatibilityCount: p._count?.compatibilities ?? p.compatibilities?.length ?? 0,
  };
};

const formatProductDetail = (p: any) => {
  const inventories = p.inventories || [];
  const lowestPrice = inventories[0] ? Number(inventories[0].sellingPrice) : Number(p.basePrice);
  const isAvailable = inventories.some((inv: any) => inv.isAvailable && inv.quantity > 0);
  const stockQuantity = inventories.reduce((acc: number, inv: any) => acc + (inv.quantity || 0), 0);

  const compatibleVehicles = (p.compatibilities || []).map((c: any) => ({
    id: c.id,
    variantId: c.variantId,
    make: c.variant?.model?.make?.name || 'Multi-Vehicle',
    model: c.variant?.model?.name || 'All Models',
    variant: c.variant?.name || 'Standard',
    year: c.variant?.year || 'All Years',
    fuelType: c.variant?.fuelType || 'All Fuels',
  }));

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    brand: p.brandRel?.name || p.brand,
    brandLogo: p.brandRel?.logoUrl || null,
    partNumber: p.partNumber,
    sku: p.sku,
    condition: p.condition,
    basePrice: Number(p.basePrice),
    mrp: Number(p.mrp),
    lowestPrice,
    weight: p.weight,
    dimensions: p.dimensions,
    tags: p.tags || [],
    images: p.images || [],
    specifications: p.specifications || p.specs || [],
    category: p.category,
    inventories: inventories.map((inv: any) => ({
      id: inv.id,
      shopId: inv.shopId,
      shop: inv.shop,
      sellingPrice: Number(inv.sellingPrice),
      quantity: inv.quantity,
      isAvailable: inv.isAvailable && inv.quantity > 0,
    })),
    compatibleVehicles,
    reviews: p.reviews || [],
    rating: p.rating || 4.5,
    reviewCount: p._count?.reviews ?? p.reviews?.length ?? 0,
    isAvailable,
    stockQuantity,
    warranty: p.warranty || '6 Months Warranty',
  };
};
