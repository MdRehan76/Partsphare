import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';
import { slugify } from '../../utils/helpers';

export const getCategoryTree = async () => {
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

export const getCategoryBySlug = async (slug: string) => {
  const cat = await prisma.category.findUnique({
    where: { slug },
    include: {
      children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      parent: true,
      _count: { select: { products: true } },
    },
  });
  if (!cat) throw AppError.notFound('Category not found.');
  return cat;
};

export const createCategory = async (data: any) => {
  const slug = data.slug || slugify(data.name);

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) throw AppError.conflict(`Category slug "${slug}" already exists.`);

  return prisma.category.create({
    data: { ...data, slug },
  });
};

export const updateCategory = async (id: string, data: any) => {
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) throw AppError.notFound('Category not found.');

  if (data.name && !data.slug) {
    data.slug = slugify(data.name);
  }

  return prisma.category.update({ where: { id }, data });
};
