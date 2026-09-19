const prisma = require('../../config/prisma');
const AppError = require('../../utils/AppError');
const { slugify, paginate, paginationMeta } = require('../../utils/helpers');

/**
 * List products with filters, search, and pagination
 */
const listProducts = async ({ page, limit, search, categoryId, condition, minPrice, maxPrice, vehicleVariantId, sortBy, sortOrder }) => {
  const { skip, take } = paginate(page, limit);

  const where = {
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
    ...(categoryId && { categoryId }),
    ...(condition && { condition }),
    ...(vehicleVariantId && {
      compatibilities: { some: { variantId: vehicleVariantId } },
    }),
    // Price filter — use inventories min price
    ...(minPrice || maxPrice ? {
      inventories: {
        some: {
          isAvailable: true,
          ...(minPrice && { sellingPrice: { gte: parseFloat(minPrice) } }),
          ...(maxPrice && { sellingPrice: { lte: parseFloat(maxPrice) } }),
        },
      },
    } : {}),
  };

  const validSortFields = { name: 'name', price: 'basePrice', createdAt: 'createdAt' };
  const orderField = validSortFields[sortBy] || 'createdAt';
  const orderDir = sortOrder === 'asc' ? 'asc' : 'desc';

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: { [orderField]: orderDir },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { id: true, name: true, slug: true } },
        inventories: {
          where: { isAvailable: true },
          select: { sellingPrice: true, quantity: true, shopId: true },
          orderBy: { sellingPrice: 'asc' },
          take: 1,
        },
        _count: { select: { reviews: true, compatibilities: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const { page: p, limit: l } = paginate(page, limit);
  return {
    products: products.map(formatProductList),
    meta: paginationMeta(total, p, l),
  };
};

/**
 * Get a single product by slug with full details
 */
const getProductBySlug = async (slug, variantId) => {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      category: true,
      inventories: {
        where: { isAvailable: true },
        include: { shop: { select: { id: true, name: true, city: true, rating: true, isVerified: true } } },
        orderBy: { sellingPrice: 'asc' },
      },
      compatibilities: {
        include: {
          variant: {
            include: { model: { include: { make: true } } },
          },
        },
        take: 20,
      },
      reviews: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      _count: { select: { reviews: true } },
    },
  });

  if (!product) throw new AppError('Product not found.', 404);
  if (product.status !== 'ACTIVE') throw new AppError('This product is not currently available.', 404);

  // Check compatibility with requested variant
  let isCompatible = null;
  if (variantId) {
    isCompatible = product.compatibilities.some((c) => c.variantId === variantId);
  }

  return { ...formatProductDetail(product), isCompatible };
};

/**
 * Get product by ID (admin use)
 */
const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true, category: true, inventories: true },
  });
  if (!product) throw new AppError('Product not found.', 404);
  return product;
};

/**
 * Create product (admin)
 */
const createProduct = async (data) => {
  const slug = data.slug || slugify(data.name);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) throw new AppError(`Product slug "${slug}" already exists.`, 409);

  const sku = data.sku || `PS-${Date.now()}`;

  return prisma.product.create({
    data: { ...data, slug, sku },
    include: { images: true, category: true },
  });
};

/**
 * Update product (admin)
 */
const updateProduct = async (id, data) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError('Product not found.', 404);

  return prisma.product.update({
    where: { id },
    data,
    include: { images: true, category: true },
  });
};

/**
 * Add product images
 */
const addProductImages = async (productId, images) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError('Product not found.', 404);

  return prisma.productImage.createMany({
    data: images.map((img, idx) => ({
      productId,
      url: img.url,
      altText: img.altText || product.name,
      isPrimary: idx === 0,
      sortOrder: idx,
    })),
  });
};

/**
 * Add vehicle compatibility to a product
 */
const addCompatibility = async (productId, variantIds) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError('Product not found.', 404);

  // Upsert to avoid unique constraint errors
  await Promise.all(
    variantIds.map((variantId) =>
      prisma.productCompatibility.upsert({
        where: { productId_variantId: { productId, variantId } },
        create: { productId, variantId },
        update: {},
      })
    )
  );

  return prisma.productCompatibility.findMany({
    where: { productId },
    include: { variant: { include: { model: { include: { make: true } } } } },
  });
};

// ---- Formatters ----

const formatProductList = (p) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  brand: p.brand,
  condition: p.condition,
  basePrice: Number(p.basePrice),
  mrp: Number(p.mrp),
  lowestPrice: p.inventories[0] ? Number(p.inventories[0].sellingPrice) : Number(p.basePrice),
  primaryImage: p.images[0]?.url || null,
  category: p.category,
  reviewCount: p._count.reviews,
  compatibilityCount: p._count.compatibilities,
});

const formatProductDetail = (p) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  description: p.description,
  brand: p.brand,
  partNumber: p.partNumber,
  sku: p.sku,
  condition: p.condition,
  basePrice: Number(p.basePrice),
  mrp: Number(p.mrp),
  weight: p.weight,
  dimensions: p.dimensions,
  tags: p.tags,
  images: p.images,
  category: p.category,
  inventories: p.inventories.map((inv) => ({
    shopId: inv.shopId,
    shop: inv.shop,
    sellingPrice: Number(inv.sellingPrice),
    quantity: inv.quantity,
  })),
  compatibilities: p.compatibilities,
  reviews: p.reviews,
  reviewCount: p._count.reviews,
});

module.exports = {
  listProducts, getProductBySlug, getProductById,
  createProduct, updateProduct, addProductImages, addCompatibility,
};
