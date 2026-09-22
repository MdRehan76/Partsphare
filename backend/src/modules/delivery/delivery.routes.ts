import { Router, Request, Response, NextFunction } from 'express';
import * as deliveryService from './delivery.service';
import prisma from '../../config/prisma';
import { successResponse } from '../../utils/response';
import { authenticate } from '../../middleware/auth.middleware';
import { AuthenticatedRequest } from '../../types';

const router = Router();

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

// Delivery partner registration
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await deliveryService.registerDeliveryPartner(req.body);
    return successResponse(res, result, 'Delivery partner registered successfully. Please upload KYC documents.', 201);
  } catch (error) {
    next(error);
  }
});

// Delivery partner login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await deliveryService.loginDeliveryPartner(req.body);
    return successResponse(res, result, 'Delivery partner login successful.');
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// AUTHENTICATED DELIVERY PORTAL ROUTES
// ============================================================================

// Partner Profile
router.get('/profile', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await deliveryService.getDeliveryProfile(req.user!.id);
    return successResponse(res, profile);
  } catch (error) {
    next(error);
  }
});

router.put('/profile', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const updated = await deliveryService.updateDeliveryProfile(req.user!.id, req.body);
    return successResponse(res, updated, 'Profile updated successfully.');
  } catch (error) {
    next(error);
  }
});

// Online / Offline Duty Status Toggle
router.put('/duty', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { isOnline } = req.body;
    const updated = await deliveryService.toggleDutyStatus(req.user!.id, isOnline);
    return successResponse(res, updated, `Duty status set to ${isOnline ? 'ONLINE' : 'OFFLINE'}.`);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// KYC MANAGEMENT & VERIFICATION
// ============================================================================

router.get('/kyc', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const kyc = await deliveryService.getKycDetails(req.user!.id);
    return successResponse(res, kyc);
  } catch (error) {
    next(error);
  }
});

router.post('/kyc/document', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await deliveryService.uploadKycDocument({
      userId: req.user!.id,
      ...req.body,
    });
    return successResponse(res, result, 'KYC document uploaded successfully.');
  } catch (error) {
    next(error);
  }
});

router.post('/kyc/submit', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await deliveryService.submitKycForReview(req.user!.id);
    return successResponse(res, result, 'KYC submitted for admin verification.');
  } catch (error) {
    next(error);
  }
});

// Admin verification toggle (accessible to admin or partner test trigger)
router.post('/kyc/verify', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const targetUserId = req.body.userId || req.user!.id;
    const result = await deliveryService.adminVerifyKyc(targetUserId, {
      status: req.body.status || 'APPROVED',
      rejectionReason: req.body.rejectionReason,
    });
    return successResponse(res, result, `KYC status updated to ${req.body.status || 'APPROVED'}.`);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// DASHBOARD & JOBS (WITH STRICT ISOLATION ACCESS CONTROL)
// ============================================================================

router.get('/dashboard', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = await deliveryService.getDeliveryDashboard(req.user!.id);
    return successResponse(res, data);
  } catch (error) {
    next(error);
  }
});

// Available open jobs feed
router.get('/jobs/available', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const jobs = await deliveryService.listAvailableJobs(req.user!.id);
    return successResponse(res, jobs);
  } catch (error) {
    next(error);
  }
});

// Create delivery job
router.post('/jobs', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const job = await prisma.deliveryAssignment.create({ data: req.body });
    return successResponse(res, job, 'Delivery job created successfully.', 201);
  } catch (error) {
    next(error);
  }
});

// Partner's claimed / assigned jobs
router.get('/jobs/my', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const filter = {
      status: req.query.status as string | undefined,
      type: req.query.type as string | undefined,
    };
    const jobs = await deliveryService.listMyJobs(req.user!.id, filter);
    return successResponse(res, jobs);
  } catch (error) {
    next(error);
  }
});

// Single job detail with navigation info (strict partner check)
router.get('/jobs/:id', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const job = await deliveryService.getJobById(req.user!.id, req.params.id as string);
    return successResponse(res, job);
  } catch (error) {
    next(error);
  }
});

// Claim / Accept job
router.post('/jobs/:id/accept', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const accepted = await deliveryService.acceptJob(req.user!.id, req.params.id as string);
    return successResponse(res, accepted, 'Delivery job accepted successfully.');
  } catch (error) {
    next(error);
  }
});

// Update delivery status (PICKED_UP -> IN_TRANSIT -> DELIVERED)
router.put('/jobs/:id/status', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { status, notes } = req.body;
    const updated = await deliveryService.updateJobStatus(req.user!.id, req.params.id as string, status, notes);
    return successResponse(res, updated, `Delivery status updated to ${status}.`);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// CASH ON DELIVERY (COD) & RECONCILIATION
// ============================================================================

// Collect COD Cash
router.post('/jobs/:id/cod', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { amount } = req.body;
    const result = await deliveryService.recordCodCollection(req.user!.id, req.params.id as string, amount);
    return successResponse(res, result, 'Cash on Delivery collection recorded successfully.');
  } catch (error) {
    next(error);
  }
});

// Settle / Reconcile cash at hub
router.post('/reconcile', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await deliveryService.reconcileCodCash(req.user!.id, req.body);
    return successResponse(res, result, 'COD cash reconciled and deposited successfully.');
  } catch (error) {
    next(error);
  }
});

// Reconciliations history
router.get('/reconciliations', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const list = await deliveryService.listReconciliations(req.user!.id);
    return successResponse(res, list);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// USED-PART DOORSTEP VERIFICATION
// ============================================================================

router.post('/jobs/:id/verify-used-part', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await deliveryService.performUsedPartVerification(req.user!.id, req.params.id as string, req.body);
    return successResponse(res, result, 'Doorstep used-part inspection recorded successfully.');
  } catch (error) {
    next(error);
  }
});

export default router;
