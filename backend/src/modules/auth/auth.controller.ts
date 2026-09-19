import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { successResponse, createdResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../types';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, firstName, lastName, email, password, phone, mobileNumber } = req.body;

    let finalFirstName = firstName;
    let finalLastName = lastName || '';

    if (name && !finalFirstName) {
      const parts = name.trim().split(/\s+/);
      finalFirstName = parts[0];
      finalLastName = parts.slice(1).join(' ') || '';
    }

    const finalPhone = phone || mobileNumber || undefined;

    const result = await authService.register({
      firstName: finalFirstName,
      lastName: finalLastName,
      email,
      password,
      phone: finalPhone,
      ipAddress: req.ip,
    });
    return createdResponse(res, result, 'Registration successful.');
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({
      email,
      password,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return successResponse(res, result, 'Login successful.');
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshTokens(refreshToken);
    return successResponse(res, tokens, 'Tokens refreshed successfully.');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    return successResponse(res, null, 'Logged out successfully.');
  } catch (error) {
    next(error);
  }
};

export const me = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getMe(req.user!.id);
    return successResponse(res, user);
  } catch (error) {
    next(error);
  }
};
