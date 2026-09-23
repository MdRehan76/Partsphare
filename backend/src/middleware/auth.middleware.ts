import { Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { verifyAccessToken } from '../utils/jwt';
import AppError from '../utils/AppError';
import prisma from '../config/prisma';

export const authenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(AppError.unauthorized('Authentication token missing or invalid.'));
    }

    const token = authHeader.split(' ')[1];
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return next(AppError.unauthorized('Token has expired. Please refresh your session.'));
      }
      return next(AppError.unauthorized('Invalid authentication token.'));
    }

    // Verify user exists and is active in DB
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, role: true, status: true, firstName: true, lastName: true },
    });

    if (!user) {
      return next(AppError.unauthorized('User associated with this token no longer exists.'));
    }

    if (user.status === 'SUSPENDED') {
      return next(AppError.forbidden('Your account has been suspended. Please contact support.'));
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required.'));
    }

    const userRole = req.user.role;
    const isAllowed = roles.includes(userRole) || (roles.includes(UserRole.ADMIN) && (userRole as string) === 'SUPER_ADMIN');
    if (!isAllowed) {
      return next(
        AppError.forbidden(`Forbidden: Requires one of [${roles.join(', ')}] role.`)
      );
    }

    next();
  };
};

export const optionalAuthenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.id },
        select: { id: true, email: true, role: true, firstName: true, lastName: true },
      });
      if (user) {
        req.user = user;
      }
    }
  } catch {
    // Ignore invalid tokens for optional authentication
  }
  next();
};
