const prisma = require('../../config/prisma');
const AppError = require('../../utils/AppError');

// ---- MASTER VEHICLE DATA ----

const getMakes = async (type) => {
  return prisma.vehicleMake.findMany({
    where: type ? { type } : {},
    orderBy: { name: 'asc' },
    include: { _count: { select: { models: true } } },
  });
};

const getModels = async (makeId) => {
  const make = await prisma.vehicleMake.findUnique({ where: { id: makeId } });
  if (!make) throw new AppError('Vehicle make not found.', 404);

  return prisma.vehicleModel.findMany({
    where: { makeId },
    orderBy: { name: 'asc' },
    include: { _count: { select: { variants: true } } },
  });
};

const getVariants = async (modelId) => {
  const model = await prisma.vehicleModel.findUnique({ where: { id: modelId } });
  if (!model) throw new AppError('Vehicle model not found.', 404);

  return prisma.vehicleVariant.findMany({
    where: { modelId },
    orderBy: [{ year: 'desc' }, { name: 'asc' }],
  });
};

// ---- MY GARAGE ----

const getMyGarage = async (userId) => {
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

const addVehicle = async (userId, { variantId, nickname, regNumber, isPrimary }) => {
  // Verify variant exists
  const variant = await prisma.vehicleVariant.findUnique({ where: { id: variantId } });
  if (!variant) throw new AppError('Vehicle variant not found.', 404);

  // If setting as primary, unset others
  if (isPrimary) {
    await prisma.customerVehicle.updateMany({ where: { userId }, data: { isPrimary: false } });
  }

  // If first vehicle, auto set as primary
  const count = await prisma.customerVehicle.count({ where: { userId } });

  return prisma.customerVehicle.create({
    data: {
      userId,
      variantId,
      nickname,
      regNumber,
      isPrimary: isPrimary || count === 0,
    },
    include: {
      variant: { include: { model: { include: { make: true } } } },
    },
  });
};

const updateVehicle = async (userId, vehicleId, { nickname, regNumber, isPrimary }) => {
  const vehicle = await prisma.customerVehicle.findFirst({ where: { id: vehicleId, userId } });
  if (!vehicle) throw new AppError('Vehicle not found in your garage.', 404);

  if (isPrimary) {
    await prisma.customerVehicle.updateMany({ where: { userId }, data: { isPrimary: false } });
  }

  return prisma.customerVehicle.update({
    where: { id: vehicleId },
    data: {
      ...(nickname !== undefined && { nickname }),
      ...(regNumber !== undefined && { regNumber }),
      ...(isPrimary !== undefined && { isPrimary }),
    },
    include: {
      variant: { include: { model: { include: { make: true } } } },
    },
  });
};

const removeVehicle = async (userId, vehicleId) => {
  const vehicle = await prisma.customerVehicle.findFirst({ where: { id: vehicleId, userId } });
  if (!vehicle) throw new AppError('Vehicle not found in your garage.', 404);

  await prisma.customerVehicle.delete({ where: { id: vehicleId } });

  // If removed vehicle was primary, set another as primary
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

module.exports = {
  getMakes, getModels, getVariants,
  getMyGarage, addVehicle, updateVehicle, removeVehicle,
};
