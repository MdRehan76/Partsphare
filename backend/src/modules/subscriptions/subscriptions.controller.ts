import { Request, Response, NextFunction } from 'express';
import * as subService from './subscriptions.service';
import { successResponse, createdResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../types';

export const listPlans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const frequency = (req.query.frequency as 'MONTHLY' | 'YEARLY') || 'MONTHLY';
    const plans = await subService.listActivePlans(frequency);
    return successResponse(res, plans, 'Subscription plans fetched successfully.');
  } catch (error) {
    next(error);
  }
};

export const getPlanDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idOrSlug = req.params.id as string;
    const frequency = (req.query.frequency as 'MONTHLY' | 'YEARLY') || 'MONTHLY';
    const plan = await subService.getPlanByIdOrSlug(idOrSlug, frequency);
    return successResponse(res, plan, 'Subscription plan details fetched successfully.');
  } catch (error) {
    next(error);
  }
};

export const getMySubscriptions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const subscriptions = await subService.getUserSubscriptions(req.user!.id);
    return successResponse(res, subscriptions, 'Customer subscriptions fetched.');
  } catch (error) {
    next(error);
  }
};

export const getMyActiveSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const active = await subService.getActiveSubscription(req.user!.id);
    return successResponse(res, active, 'Active subscription fetched.');
  } catch (error) {
    next(error);
  }
};

export const subscribeToPlan = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await subService.createSubscriptionOrder(req.user!.id, req.body);
    return createdResponse(res, result, result.message || 'Subscription order initiated successfully.');
  } catch (error) {
    next(error);
  }
};

export const verifySubscriptionPayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await subService.verifySubscriptionPayment(req.user!.id, req.body);
    return successResponse(res, result, result.message || 'Payment verified & subscription activated.');
  } catch (error) {
    next(error);
  }
};

export const cancelSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const subscriptionId = req.params.id as string;
    const { reason } = req.body;
    const result = await subService.cancelSubscription(req.user!.id, subscriptionId, reason);
    return successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

export const toggleAutoRenew = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const subscriptionId = req.params.id as string;
    const { autoRenew } = req.body;
    const result = await subService.toggleAutoRenew(req.user!.id, subscriptionId, autoRenew);
    return successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

export const renewSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const subscriptionId = req.params.id as string;
    const result = await subService.simulateRenewal(req.user!.id, subscriptionId);
    return successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

export const expireSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const subscriptionId = req.params.id as string;
    const result = await subService.expireSubscription(req.user!.id, subscriptionId);
    return successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

export const useEntitlement = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const subscriptionId = req.params.id as string;
    const { featureCode } = req.body;
    const result = await subService.useEntitlement(req.user!.id, subscriptionId, featureCode);
    return successResponse(res, result, `Entitlement applied successfully.`);
  } catch (error) {
    next(error);
  }
};
