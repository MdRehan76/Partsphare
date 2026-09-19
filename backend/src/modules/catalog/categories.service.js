const prisma = require('../../config/prisma');
const AppError = require('../../utils/AppError');
const { slugify } = require('../../utils/helpers');

/**
 * Get full category tree (root categories with children)
 */
const getCategoryTree = async () => {
  const roots = await prisma.category.findMany({
    where: { parentId: null, isActive: true },
    include: {
      children: {
        where: { isActive: true },
        include: {
          children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
          _count: { select: { products: true } },
        },
        orderBy: { sortOrder: 'asc' },
      },
      _count: { select: { products: true } },
    },
    orderBy: { sortOrder: 'asc' },
  });
  return roots;
};

/**
 * Get a single category by slug with products count
 */
const getCategoryBySlug = async (slug) => {
  const cat = await prisma.category.findUnique({
    where: { slug },
    include: {
      children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      parent: true,
      _count: { select: { products: true } },
    },
  });
  if (!cat) throw new AppError('Category not found.', 404);
  return cat;
};

/**
 * Create a category (admin)
 */
const createCategory = async (data) => {
  const slug = data.slug || slugify(data.name);

  // Ensure slug uniqueness
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) throw new AppError(`Category slug "${slug}" already exists.`, 409);

  return prisma.category.create({
    data: { ...data, slug },
  });
};

/**
 * Update a category (admin)
 */
const updateCategory = async (id, data) => {
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) throw new AppError('Category not found.', 404);

  if (data.name && !data.slug) {
    data.slug = slugify(data.name);
  }

  return prisma.category.update({ where: { id }, data });
};

module.exports = { getCategoryTree, getCategoryBySlug, createCategory, updateCategory };
