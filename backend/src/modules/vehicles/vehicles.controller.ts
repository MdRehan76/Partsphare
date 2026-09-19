import { Request, Response, NextFunction } from 'express';
import * as vehiclesService from './vehicles.service';
import { successResponse, createdResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../types';
import { VehicleType } from '@prisma/client';

export const getMakes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const type = req.query.type as VehicleType | undefined;
    const makes = await vehiclesService.getMakes(type);
    return successResponse(res, makes);
  } catch (error) {
    next(error);
  }
};

export const getModels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const makeId = req.params.makeId as string;
    const models = await vehiclesService.getModels(makeId);
    return successResponse(res, models);
  } catch (error) {
    next(error);
  }
};

export const getVariants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const modelId = req.params.modelId as string;
    const variants = await vehiclesService.getVariants(modelId);
    return successResponse(res, variants);
  } catch (error) {
    next(error);
  }
};

export const getMyGarage = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const garage = await vehiclesService.getMyGarage(req.user!.id);
    return successResponse(res, garage);
  } catch (error) {
    next(error);
  }
};

export const addVehicle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const vehicle = await vehiclesService.addVehicle(req.user!.id, req.body);
    return createdResponse(res, vehicle, 'Vehicle added to garage.');
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const vehicleId = req.params.id as string;
    const vehicle = await vehiclesService.updateVehicle(req.user!.id, vehicleId, req.body);
    return successResponse(res, vehicle, 'Garage vehicle updated.');
  } catch (error) {
    next(error);
  }
};

export const setPrimaryVehicle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const vehicleId = req.params.id as string;
    const vehicle = await vehiclesService.setPrimaryVehicle(req.user!.id, vehicleId);
    return successResponse(res, vehicle, 'Primary vehicle updated.');
  } catch (error) {
    next(error);
  }
};

export const removeVehicle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const vehicleId = req.params.id as string;
    await vehiclesService.removeVehicle(req.user!.id, vehicleId);
    return successResponse(res, null, 'Vehicle removed from garage.');
  } catch (error) {
    next(error);
  }
};
