import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';
import { UsedPartStatus } from '@prisma/client';

export const listVerifiedUsedParts = async () => {
  return prisma.usedPartListing.findMany({
    where: {
      status: UsedPartStatus.LISTED,
      isSold: false,
    },
    include: {
      seller: { select: { firstName: true, lastName: true } },
      product: { select: { id: true, name: true, sku: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const createUsedPartListing = async (
  sellerId: string,
  data: { title: string; description: string; askingPrice: number; condition: string; images: string[]; productId?: string }
) => {
  return prisma.usedPartListing.create({
    data: {
      sellerId,
      title: data.title,
      description: data.description,
      askingPrice: data.askingPrice,
      condition: data.condition,
      images: data.images,
      productId: data.productId || null,
      status: UsedPartStatus.PENDING_VERIFICATION,
    },
  });
};
