import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { logAudit } from '../../utils/audit';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const safeUser = (user: any) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  avatar: user.avatar,
  role: user.role,
  status: user.status,
  createdAt: user.createdAt,
});

export const register = async ({
  firstName,
  lastName,
  email,
  password,
  phone,
  ipAddress,
}: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  ipAddress?: string;
}) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw AppError.conflict('An account with this email already exists.');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: { firstName, lastName, email, password: hashedPassword, phone },
    });
    // Create cart for the new customer
    await tx.cart.create({ data: { userId: newUser.id } });
    return newUser;
  });

  await logAudit({
    userId: user.id,
    action: 'USER_REGISTERED',
    entityType: 'User',
    entityId: user.id,
    ipAddress,
  });

  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  });
  const refreshToken = generateRefreshToken({ id: user.id });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  return { user: safeUser(user), accessToken, refreshToken };
};

export const login = async ({
  email,
  password,
  ipAddress,
  userAgent,
}: {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw AppError.unauthorized('Invalid email or password.');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw AppError.unauthorized('Invalid email or password.');
  }

  if (user.status === 'SUSPENDED') {
    throw AppError.forbidden('Your account has been suspended. Please contact support.');
  }

  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  });
  const refreshToken = generateRefreshToken({ id: user.id });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  await logAudit({
    userId: user.id,
    action: 'USER_LOGIN',
    entityType: 'User',
    entityId: user.id,
    ipAddress,
    userAgent,
  });

  return { user: safeUser(user), accessToken, refreshToken };
};

export const refreshTokens = async (refreshToken: string) => {
  let decoded: { id: string };
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw AppError.unauthorized('Invalid or expired refresh token.');
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!storedToken || storedToken.isRevoked) {
    throw AppError.unauthorized('Refresh token revoked or invalid. Please log in again.');
  }

  if (storedToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    throw AppError.unauthorized('Refresh token expired. Please log in again.');
  }

  if (storedToken.user.status === 'SUSPENDED') {
    throw AppError.forbidden('Your account has been suspended.');
  }

  // Token rotation
  await prisma.refreshToken.delete({ where: { token: refreshToken } });

  const newAccessToken = generateAccessToken({
    id: storedToken.user.id,
    email: storedToken.user.email,
    role: storedToken.user.role,
    firstName: storedToken.user.firstName,
    lastName: storedToken.user.lastName,
  });
  const newRefreshToken = generateRefreshToken({ id: storedToken.user.id });

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: storedToken.user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logout = async (refreshToken?: string) => {
  if (!refreshToken) return;
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
};

export const getMe = async (userId: string) => {
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
      _count: {
        select: { orders: true, customerVehicles: true },
      },
    },
  });

  if (!user) throw AppError.notFound('User not found.');
  return user;
};
