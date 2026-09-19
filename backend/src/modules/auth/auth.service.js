const bcrypt = require('bcryptjs');
const prisma = require('../../config/prisma');
const AppError = require('../../utils/AppError');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../../utils/jwt');
const { sendWelcomeEmail } = require('../../utils/mailer');
const config = require('../../config');

// How long refresh tokens are valid (parse from config)
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Safe user shape — never return password hash to client
 */
const safeUser = (user) => ({
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

/**
 * Register a new customer
 */
const register = async ({ firstName, lastName, email, password, phone }) => {
  // Check duplicate email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  // Hash password (cost factor 12)
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user + empty cart atomically
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: { firstName, lastName, email, password: hashedPassword, phone },
    });
    // Create cart for the new customer
    await tx.cart.create({ data: { userId: newUser.id } });
    return newUser;
  });

  // Send welcome email (non-blocking)
  sendWelcomeEmail(user).catch(() => {});

  // Issue tokens
  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });

  // Persist refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  return { user: safeUser(user), accessToken, refreshToken };
};

/**
 * Login with email and password
 */
const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (user.status === 'SUSPENDED') {
    throw new AppError('Your account has been suspended. Please contact support.', 403);
  }

  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });

  // Persist refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  return { user: safeUser(user), accessToken, refreshToken };
};

/**
 * Refresh access token using a valid refresh token
 */
const refreshTokens = async (refreshToken) => {
  // Verify JWT signature first
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('Invalid or expired refresh token.', 401);
  }

  // Check if token exists in DB (allows invalidation / rotation)
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: { select: { id: true, email: true, role: true, status: true } } },
  });

  if (!storedToken) {
    throw new AppError('Refresh token not recognised. Please log in again.', 401);
  }

  if (storedToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    throw new AppError('Refresh token expired. Please log in again.', 401);
  }

  if (storedToken.user.status === 'SUSPENDED') {
    throw new AppError('Your account has been suspended.', 403);
  }

  // Rotate: delete old token, issue new pair
  await prisma.refreshToken.delete({ where: { token: refreshToken } });

  const newAccessToken = generateAccessToken({
    id: storedToken.user.id,
    email: storedToken.user.email,
    role: storedToken.user.role,
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

/**
 * Logout — invalidate the refresh token
 */
const logout = async (refreshToken) => {
  if (!refreshToken) return;
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
};

/**
 * Get current authenticated user
 */
const getMe = async (userId) => {
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

  if (!user) throw new AppError('User not found.', 404);
  return user;
};

module.exports = { register, login, refreshTokens, logout, getMe };
