import { Router, Request, Response, NextFunction } from 'express';
import * as shopsService from './shops.service';
import { successResponse } from '../../utils/response';
import { authenticate } from '../../middleware/auth.middleware';
import { AuthenticatedRequest } from '../../types';

const router = Router();

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

// List verified shops for customer portal / catalog
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const city = req.query.city as string | undefined;
    const shops = await shopsService.listVerifiedShops(city);
    return successResponse(res, shops);
  } catch (error) {
    next(error);
  }
});

// Shop registration
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await shopsService.registerShop(req.body);
    return successResponse(res, result, 'Shop registered successfully.', 201);
  } catch (error) {
    next(error);
  }
});

// Shop login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await shopsService.loginShop(req.body);
    return successResponse(res, result, 'Shop login successful.');
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// AUTHENTICATED SHOP PORTAL ROUTES
// ============================================================================

// Shop profile
router.get('/portal/profile', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await shopsService.getShopProfile(req.user!.id);
    return successResponse(res, profile);
  } catch (error) {
    next(error);
  }
});

router.put('/portal/profile', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const updated = await shopsService.updateShopProfile(req.user!.id, req.body);
    return successResponse(res, updated, 'Shop profile updated successfully.');
  } catch (error) {
    next(error);
  }
});

// Shop dashboard KPI metrics
router.get('/portal/dashboard', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const dashboard = await shopsService.getShopDashboard(req.user!.id);
    return successResponse(res, dashboard);
  } catch (error) {
    next(error);
  }
});

// Service calendar & jobs schedule
router.get('/portal/calendar', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const jobs = await shopsService.getServiceCalendar(req.user!.id, {
      status: req.query.status as string,
      date: req.query.date as string,
      jobType: req.query.jobType as string,
    });
    return successResponse(res, jobs);
  } catch (error) {
    next(error);
  }
});

// Update service job status (SCHEDULED -> ACCEPTED -> IN_PROGRESS -> COMPLETED -> CANCELLED)
router.patch('/portal/jobs/:id/status', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await shopsService.updateJobStatus(
      req.user!.id,
      req.params.id as string,
      req.body.status,
      req.body.notes
    );
    return successResponse(res, result, `Job status updated to ${req.body.status}.`);
  } catch (error) {
    next(error);
  }
});

// Commission ledger & earnings
router.get('/portal/commission', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ledger = await shopsService.getCommissionLedger(req.user!.id);
    return successResponse(res, ledger);
  } catch (error) {
    next(error);
  }
});

// Request commission payout
router.post('/portal/commission/payout', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const payout = await shopsService.requestCommissionPayout(req.user!.id);
    return successResponse(res, payout, payout.message);
  } catch (error) {
    next(error);
  }
});

// Incoming parts deliveries
router.get('/portal/deliveries', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const deliveries = await shopsService.listIncomingDeliveries(req.user!.id);
    return successResponse(res, deliveries);
  } catch (error) {
    next(error);
  }
});

// Mark delivery as received
router.patch('/portal/deliveries/:id/receive', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const delivery = await shopsService.receiveDelivery(
      req.user!.id,
      req.params.id as string,
      req.body.receivedBy
    );
    return successResponse(res, delivery, 'Delivery marked as received successfully.');
  } catch (error) {
    next(error);
  }
});

// Shop inventory listing
router.get('/portal/inventory', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const inventory = await shopsService.getShopInventory(req.user!.id);
    return successResponse(res, inventory);
  } catch (error) {
    next(error);
  }
});

// Shop stock adjustment
router.patch('/portal/inventory/:id/stock', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const updated = await shopsService.updateShopStock(
      req.user!.id,
      req.params.id as string,
      req.body.quantity,
      req.body.lowStockThreshold
    );
    return successResponse(res, updated, 'Workshop inventory stock updated successfully.');
  } catch (error) {
    next(error);
  }
});

// Used-part intake queue
router.get('/portal/used-parts', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const intakes = await shopsService.listUsedPartIntakes(req.user!.id);
    return successResponse(res, intakes);
  } catch (error) {
    next(error);
  }
});

// Record used-part inspection & testing
router.post('/portal/used-parts', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const intake = await shopsService.recordUsedPartIntake(req.user!.id, req.body);
    return successResponse(res, intake, 'Used part intake registered successfully.', 201);
  } catch (error) {
    next(error);
  }
});

// Support tickets
router.get('/portal/tickets', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const tickets = await shopsService.listShopTickets(req.user!.id);
    return successResponse(res, tickets);
  } catch (error) {
    next(error);
  }
});

router.post('/portal/tickets', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ticket = await shopsService.createShopTicket(req.user!.id, req.body);
    return successResponse(res, ticket, 'Support ticket submitted successfully.', 201);
  } catch (error) {
    next(error);
  }
});

router.post('/portal/tickets/:id/messages', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const updated = await shopsService.addTicketMessage(
      req.user!.id,
      req.params.id as string,
      req.body.message,
      req.body.senderName
    );
    return successResponse(res, updated, 'Message appended to ticket.');
  } catch (error) {
    next(error);
  }
});

// Get shop by slug (Keep at end so /portal routes are not matched as slugs)
router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shop = await shopsService.getShopBySlug(req.params.slug as string);
    return successResponse(res, shop);
  } catch (error) {
    next(error);
  }
});

export default router;
