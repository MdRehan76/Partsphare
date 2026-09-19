const prisma = require('../../config/prisma');
const AppError = require('../../utils/AppError');
const bcrypt = require('bcryptjs');

/**
 * Get user profile
 */
const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, firstName: true, lastName: true,
      email: true, phone: true, avatar: true,
      role: true, status: true, createdAt: true,
    },
  });
  if (!user) throw new AppError('User not found.', 404);
  return user;
};

/**
 * Update user profile (name, phone, avatar)
 */
const updateProfile = async (userId, { firstName, lastName, phone, avatar }) => {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(phone !== undefined && { phone }),
      ...(avatar !== undefined && { avatar }),
    },
    select: {
      id: true, firstName: true, lastName: true,
      email: true, phone: true, avatar: true, role: true,
    },
  });
  return updated;
};

/**
 * Change password
 */
const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found.', 404);

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) throw new AppError('Current password is incorrect.', 400);

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

  // Invalidate all refresh tokens (force re-login on other devices)
  await prisma.refreshToken.deleteMany({ where: { userId } });
};

// ---- ADDRESSES ----

const getAddresses = async (userId) => {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
};

const createAddress = async (userId, data) => {
  // If this is set as default, unset others first
  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  // If this is the first address, make it default automatically
  const count = await prisma.address.count({ where: { userId } });
  if (count === 0) data.isDefault = true;

  return prisma.address.create({ data: { userId, ...data } });
};

const updateAddress = async (userId, addressId, data) => {
  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) throw new AppError('Address not found.', 404);

  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  return prisma.address.update({ where: { id: addressId }, data });
};

const deleteAddress = async (userId, addressId) => {
  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) throw new AppError('Address not found.', 404);

  await prisma.address.delete({ where: { id: addressId } });

  // If deleted address was default, make most recent one default
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

const setDefaultAddress = async (userId, addressId) => {
  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) throw new AppError('Address not found.', 404);

  await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  return prisma.address.update({ where: { id: addressId }, data: { isDefault: true } });
};

module.exports = {
  getProfile, updateProfile, changePassword,
  getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress,
};
