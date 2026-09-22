import { Request, Response, NextFunction } from 'express';
import * as paymentsService from './payments.service';
import { successResponse, createdResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../types';

export const createPaymentOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.body;
    const result = await paymentsService.createRazorpayPaymentOrder(req.user!.id, orderId);
    return successResponse(res, result, 'Razorpay sandbox payment order initialized successfully.');
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await paymentsService.verifyRazorpayPayment(req.user!.id, req.body);
    return successResponse(res, result, 'Payment verified and captured successfully.');
  } catch (error) {
    next(error);
  }
};

export const recordPaymentFailure = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await paymentsService.recordPaymentFailure(req.user!.id, req.body);
    return successResponse(res, result, 'Payment failure safely recorded.');
  } catch (error) {
    next(error);
  }
};

export const retryPayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.orderId as string;
    const result = await paymentsService.retryPayment(req.user!.id, orderId);
    return successResponse(res, result, 'Payment retry session initialized successfully.');
  } catch (error) {
    next(error);
  }
};

export const getPaymentStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.orderId as string;
    const result = await paymentsService.getPaymentStatus(req.user!.id, orderId);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

export const switchPaymentMethod = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.orderId as string;
    const result = await paymentsService.switchPaymentMethodToCOD(req.user!.id, orderId);
    return successResponse(res, { order: result }, 'Payment method switched to Cash on Delivery.');
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = (req.headers['x-razorpay-signature'] as string) || '';
    const result = await paymentsService.handleWebhook(req.body, signature);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
