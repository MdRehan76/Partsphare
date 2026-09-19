import { VehicleType } from '@prisma/client';
import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';

// ---- MASTER VEHICLE DATA ----

export const getMakes = async (type?: string) => {
  let whereClause = {};

  if (type) {
    const upper = type.toUpperCase();
    if (upper === '2_WHEELER' || upper === '2-WHEELER' || upper === 'TWO_WHEELER') {
      whereClause = { type: { in: [VehicleType.BIKE, VehicleType.SCOOTER] } };
    } else if (upper === '4_WHEELER' || upper === '4-WHEELER' || upper === 'FOUR_WHEELER') {
      whereClause = { type: VehicleType.CAR };
    } else if (Object.values(VehicleType).includes(upper as VehicleType)) {
      whereClause = { type: upper as VehicleType };
    }
  }

  return prisma.vehicleMake.findMany({
    where: whereClause,
    orderBy: { name: 'asc' },
    include: { _count: { select: { models: true } } },
  });
};

export const getModels = async (makeId: string) => {
  const make = await prisma.vehicleMake.findUnique({ where: { id: makeId } });
  if (!make) throw AppError.notFound('Vehicle make not found.');

  return prisma.vehicleModel.findMany({
    where: { makeId },
    orderBy: { name: 'asc' },
    include: { _count: { select: { variants: true } } },
  });
};

export const getVariants = async (modelId: string) => {
  const model = await prisma.vehicleModel.findUnique({ where: { id: modelId } });
  if (!model) throw AppError.notFound('Vehicle model not found.');

  return prisma.vehicleVariant.findMany({
    where: { modelId },
    orderBy: [{ year: 'desc' }, { name: 'asc' }],
  });
};

// ---- MY GARAGE ----

export const getMyGarage = async (userId: string) => {
  return prisma.customerVehicle.findMany({
    where: { userId },
    include: {
      variant: {
        include: {
          model: { include: { make: true } },
        },
      },
    },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
  });
};

export const addVehicle = async (
  userId: string,
  {
    variantId,
    nickname,
    regNumber,
    isPrimary,
  }: {
    variantId: string;
    nickname?: string | null;
    regNumber?: string | null;
    isPrimary?: boolean;
  }
) => {
  const variant = await prisma.vehicleVariant.findUnique({ where: { id: variantId } });
  if (!variant) throw AppError.notFound('Vehicle variant not found.');

  if (isPrimary) {
    await prisma.customerVehicle.updateMany({ where: { userId }, data: { isPrimary: false } });
  }

  const count = await prisma.customerVehicle.count({ where: { userId } });

  return prisma.customerVehicle.create({
    data: {
      userId,
      variantId,
      nickname,
      regNumber,
      isPrimary: isPrimary ?? count === 0,
    },
    include: {
      variant: { include: { model: { include: { make: true } } } },
    },
  });
};

export const updateVehicle = async (
  userId: string,
  vehicleId: string,
  {
    variantId,
    nickname,
    regNumber,
    isPrimary,
  }: {
    variantId?: string;
    nickname?: string | null;
    regNumber?: string | null;
    isPrimary?: boolean;
  }
) => {
  const vehicle = await prisma.customerVehicle.findFirst({ where: { id: vehicleId, userId } });
  if (!vehicle) throw AppError.notFound('Vehicle not found in your garage.');

  if (variantId) {
    const variant = await prisma.vehicleVariant.findUnique({ where: { id: variantId } });
    if (!variant) throw AppError.notFound('Vehicle variant not found.');
  }

  if (isPrimary) {
    await prisma.customerVehicle.updateMany({ where: { userId }, data: { isPrimary: false } });
  }

  return prisma.customerVehicle.update({
    where: { id: vehicleId },
    data: {
      ...(variantId !== undefined && { variantId }),
      ...(nickname !== undefined && { nickname }),
      ...(regNumber !== undefined && { regNumber }),
      ...(isPrimary !== undefined && { isPrimary }),
    },
    include: {
      variant: { include: { model: { include: { make: true } } } },
    },
  });
};

export const setPrimaryVehicle = async (userId: string, vehicleId: string) => {
  const vehicle = await prisma.customerVehicle.findFirst({ where: { id: vehicleId, userId } });
  if (!vehicle) throw AppError.notFound('Vehicle not found in your garage.');

  await prisma.customerVehicle.updateMany({
    where: { userId },
    data: { isPrimary: false },
  });

  return prisma.customerVehicle.update({
    where: { id: vehicleId },
    data: { isPrimary: true },
    include: {
      variant: { include: { model: { include: { make: true } } } },
    },
  });
};

export const removeVehicle = async (userId: string, vehicleId: string) => {
  const vehicle = await prisma.customerVehicle.findFirst({ where: { id: vehicleId, userId } });
  if (!vehicle) throw AppError.notFound('Vehicle not found in your garage.');

  await prisma.customerVehicle.delete({ where: { id: vehicleId } });

  if (vehicle.isPrimary) {
    const next = await prisma.customerVehicle.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    if (next) {
      await prisma.customerVehicle.update({ where: { id: next.id }, data: { isPrimary: true } });
    }
  }
};
