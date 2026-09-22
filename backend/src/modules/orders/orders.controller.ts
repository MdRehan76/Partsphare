import { Response, NextFunction } from 'express';
import * as ordersService from './orders.service';
import { successResponse, createdResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../types';

export const listOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await ordersService.listCustomerOrders(req.user!.id);
    return successResponse(res, orders);
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;
    const order = await ordersService.getOrderById(req.user!.id, orderId);
    return successResponse(res, order);
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const order = await ordersService.createOrderDraft(req.user!.id, req.body);
    return createdResponse(res, order, 'Order created successfully.');
  } catch (error) {
    next(error);
  }
};

export const getCheckoutQuote = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const quote = await ordersService.getCheckoutQuote(req.user!.id, req.body);
    return successResponse(res, quote, 'Checkout quote generated successfully.');
  } catch (error) {
    next(error);
  }
};

export const getOrderTracking = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;
    const tracking = await ordersService.getOrderTracking(orderId);
    return successResponse(res, tracking);
  } catch (error) {
    next(error);
  }
};

