import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';
import bcrypt from 'bcryptjs';

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
  if (!user) throw AppError.notFound('User not found.');
  return user;
};

export const updateProfile = async (
  userId: string,
  { firstName, lastName, phone, avatar }: { firstName?: string; lastName?: string; phone?: string | null; avatar?: string | null }
) => {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(phone !== undefined && { phone }),
      ...(avatar !== undefined && { avatar }),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
    },
  });
  return updated;
};

export const changePassword = async (
  userId: string,
  { currentPassword, newPassword }: { currentPassword: string; newPassword: string }
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.notFound('User not found.');

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) throw AppError.badRequest('Current password is incorrect.');

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

  // Invalidate all refresh tokens (force re-login on other devices)
  await prisma.refreshToken.deleteMany({ where: { userId } });
};

// ---- ADDRESSES ----

export const getAddresses = async (userId: string) => {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
};

export const createAddress = async (userId: string, data: any) => {
  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  const count = await prisma.address.count({ where: { userId } });
  if (count === 0) data.isDefault = true;

  return prisma.address.create({ data: { userId, ...data } });
};

export const updateAddress = async (userId: string, addressId: string, data: any) => {
  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) throw AppError.notFound('Address not found.');

  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  return prisma.address.update({ where: { id: addressId }, data });
};

export const deleteAddress = async (userId: string, addressId: string) => {
  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) throw AppError.notFound('Address not found.');

  await prisma.address.delete({ where: { id: addressId } });

  if (address.isDefault) {
    const latest = await prisma.address.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    if (latest) {
      await prisma.address.update({ where: { id: latest.id }, data: { isDefault: true } });
    }
  }
};

export const setDefaultAddress = async (userId: string, addressId: string) => {
  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) throw AppError.notFound('Address not found.');

  await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  return prisma.address.update({ where: { id: addressId }, data: { isDefault: true } });
};
