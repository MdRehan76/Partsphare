import { Response, NextFunction } from 'express';
import * as usersService from './users.service';
import { successResponse, createdResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../types';

export const getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await usersService.getProfile(req.user!.id);
    return successResponse(res, profile);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const updated = await usersService.updateProfile(req.user!.id, req.body);
    return successResponse(res, updated, 'Profile updated successfully.');
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await usersService.changePassword(req.user!.id, req.body);
    return successResponse(res, null, 'Password changed successfully. Please log in again.');
  } catch (error) {
    next(error);
  }
};

export const getAddresses = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const addresses = await usersService.getAddresses(req.user!.id);
    return successResponse(res, addresses);
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const address = await usersService.createAddress(req.user!.id, req.body);
    return createdResponse(res, address, 'Address added successfully.');
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const addressId = req.params.id as string;
    const address = await usersService.updateAddress(req.user!.id, addressId, req.body);
    return successResponse(res, address, 'Address updated successfully.');
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const addressId = req.params.id as string;
    await usersService.deleteAddress(req.user!.id, addressId);
    return successResponse(res, null, 'Address deleted successfully.');
  } catch (error) {
    next(error);
  }
};

export const setDefaultAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const addressId = req.params.id as string;
    const address = await usersService.setDefaultAddress(req.user!.id, addressId);
    return successResponse(res, address, 'Default address updated.');
  } catch (error) {
    next(error);
  }
};
