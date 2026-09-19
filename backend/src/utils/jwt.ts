import jwt from 'jsonwebtoken';
import config from '../config/env';
import { AuthUserPayload } from '../types';

export const generateAccessToken = (payload: AuthUserPayload): string => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn as any,
  });
};

export const generateRefreshToken = (payload: { id: string }): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as any,
  });
};

export const verifyAccessToken = (token: string): AuthUserPayload => {
  return jwt.verify(token, config.jwt.accessSecret) as AuthUserPayload;
};

export const verifyRefreshToken = (token: string): { id: string } => {
  return jwt.verify(token, config.jwt.refreshSecret) as { id: string };
};
