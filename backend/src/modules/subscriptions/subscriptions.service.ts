import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';

export const listActivePlans = async () => {
  return prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    include: {
      entitlements: true,
    },
    orderBy: { price: 'asc' },
  });
};

export const getUserSubscription = async (userId: string) => {
  return prisma.customerSubscription.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: {
      plan: {
        include: {
          entitlements: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};
