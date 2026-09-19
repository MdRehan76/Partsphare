import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';

export const listVerifiedShops = async (city?: string) => {
  return prisma.shop.findMany({
    where: {
      isVerified: true,
      isActive: true,
      ...(city && { city: { equals: city, mode: 'insensitive' } }),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      phone: true,
      city: true,
      state: true,
      pincode: true,
      rating: true,
      totalRatings: true,
      serviceAvailable: true,
      logoUrl: true,
    },
    orderBy: { rating: 'desc' },
  });
};

export const getShopBySlug = async (slug: string) => {
  const shop = await prisma.shop.findUnique({
    where: { slug },
    include: {
      owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      inventories: {
        where: { isAvailable: true },
        include: { product: { include: { images: true } } },
        take: 20,
      },
    },
  });
  if (!shop) throw AppError.notFound('Shop not found.');
  return shop;
};
