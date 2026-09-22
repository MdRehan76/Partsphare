import { Router, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { successResponse, createdResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../types';
import * as adminService from './admin.service';

const router = Router();

// ============================================================================
// STRICT RBAC: ALL ADMIN ROUTES REQUIRE 'ADMIN' OR 'SUPER_ADMIN' ROLE
// Non-admin tokens (CUSTOMER, SHOP_OWNER, DELIVERY_PARTNER) will receive 403 Forbidden!
// ============================================================================
router.use(authenticate);
router.use(authorize('ADMIN' as any));

// ============================================================================
// 1. ANALYTICS & KPIS
// ============================================================================
router.get('/analytics/kpis', async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = await adminService.getAdminKPIs();
    return successResponse(res, data);
  } catch (error) {
    next(error);
  }
});

router.get('/analytics/charts', async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = await adminService.getAdminCharts();
    return successResponse(res, data);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// 2. CUSTOMER MANAGEMENT
// ============================================================================
router.get('/customers', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { search, status } = req.query;
    const customers = await adminService.listCustomers({
      search: search ? String(search) : undefined,
      status: status ? String(status) : undefined,
    });
    return successResponse(res, customers);
  } catch (error) {
    next(error);
  }
});

router.patch('/customers/:id/status', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;
    const updated = await adminService.updateCustomerStatus(id, status);
    return successResponse(res, updated, 'Customer status updated successfully.');
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// 3. SHOP MANAGEMENT & COMMISSIONS
// ============================================================================
router.get('/shops', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { status, city, search } = req.query;
    const shops = await adminService.listShops({
      status: status ? String(status) : undefined,
      city: city ? String(city) : undefined,
      search: search ? String(search) : undefined,
    });
    return successResponse(res, shops);
  } catch (error) {
    next(error);
  }
});

router.patch('/shops/:id/verification', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const updated = await adminService.verifyShop(id, req.body);
    return successResponse(res, updated, 'Shop verification status updated.');
  } catch (error) {
    next(error);
  }
});

router.patch('/shops/:id/commission', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const { commissionRate } = req.body;
    const updated = await adminService.updateShopCommission(id, Number(commissionRate));
    return successResponse(res, updated, `Commission rate updated to ${commissionRate}%.`);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// 4. DELIVERY PARTNERS & KYC
// ============================================================================
router.get('/delivery-partners', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { status, search } = req.query;
    const partners = await adminService.listDeliveryPartners({
      status: status ? String(status) : undefined,
      search: search ? String(search) : undefined,
    });
    return successResponse(res, partners);
  } catch (error) {
    next(error);
  }
});

router.patch('/delivery-partners/:id/kyc', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const result = await adminService.verifyDeliveryPartnerKyc(id, req.body);
    return successResponse(res, result, 'Delivery partner KYC verification completed.');
  } catch (error) {
    next(error);
  }
});

router.patch('/delivery-partners/:id/activation', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const { isActivated } = req.body;
    const updated = await adminService.togglePartnerActivation(id, Boolean(isActivated));
    return successResponse(res, updated, `Delivery partner ${isActivated ? 'activated' : 'deactivated'}.`);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// 5. PRODUCTS & INVENTORY
// ============================================================================
router.get('/products', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { search, categoryId, status } = req.query;
    const products = await adminService.listProducts({
      search: search ? String(search) : undefined,
      categoryId: categoryId ? String(categoryId) : undefined,
      status: status ? String(status) : undefined,
    });
    return successResponse(res, products);
  } catch (error) {
    next(error);
  }
});

router.post('/products', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const newProduct = await adminService.createProduct(req.body);
    return createdResponse(res, newProduct, 'Product created successfully.');
  } catch (error) {
    next(error);
  }
});

router.patch('/products/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const updated = await adminService.updateProduct(id, req.body);
    return successResponse(res, updated, 'Product updated successfully.');
  } catch (error) {
    next(error);
  }
});

router.delete('/products/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const removed = await adminService.deleteProduct(id);
    return successResponse(res, removed, 'Product removed successfully.');
  } catch (error) {
    next(error);
  }
});

router.get('/inventory', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const lowStockOnly = req.query.lowStock === 'true';
    const inventory = await adminService.listInventory(lowStockOnly);
    return successResponse(res, inventory);
  } catch (error) {
    next(error);
  }
});

router.patch('/inventory/:id/stock', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const updated = await adminService.updateInventoryStock(id, req.body);
    return successResponse(res, updated, 'Inventory stock level adjusted.');
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// 6. PLATFORM CONFIGURATION (DIFM, COMMISSIONS, SUBSCRIPTIONS)
// ============================================================================
router.get('/config/difm', async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const config = await adminService.getDifmConfig();
    return successResponse(res, config);
  } catch (error) {
    next(error);
  }
});

router.put('/config/difm', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const updated = await adminService.updateDifmConfig(req.body);
    return successResponse(res, updated, 'DIFM configuration updated.');
  } catch (error) {
    next(error);
  }
});

router.get('/config/commissions', async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const config = await adminService.getCommissionConfig();
    return successResponse(res, config);
  } catch (error) {
    next(error);
  }
});

router.put('/config/commissions', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const updated = await adminService.updateCommissionConfig(req.body);
    return successResponse(res, updated, 'Global commission configuration updated.');
  } catch (error) {
    next(error);
  }
});

router.get('/config/subscriptions', async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const plans = await adminService.listSubscriptionPlans();
    return successResponse(res, plans);
  } catch (error) {
    next(error);
  }
});

router.patch('/config/subscriptions/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const updated = await adminService.updateSubscriptionPlan(id, req.body);
    return successResponse(res, updated, 'Subscription plan updated.');
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// 7. USED PARTS OVERSIGHT
// ============================================================================
router.get('/used-parts', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status ? String(req.query.status) : undefined;
    const listings = await adminService.listUsedParts({ status });
    return successResponse(res, listings);
  } catch (error) {
    next(error);
  }
});

router.patch('/used-parts/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const updated = await adminService.updateUsedPart(id, req.body);
    return successResponse(res, updated, 'Used part listing updated.');
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// 8. DELIVERIES FLEET MANAGEMENT
// ============================================================================
router.get('/deliveries', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status ? String(req.query.status) : undefined;
    const partnerId = req.query.partnerId ? String(req.query.partnerId) : undefined;
    const deliveries = await adminService.listDeliveries({ status, partnerId });
    return successResponse(res, deliveries);
  } catch (error) {
    next(error);
  }
});

router.patch('/deliveries/:id/reassign', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const { deliveryPartnerId } = req.body;
    const updated = await adminService.reassignDelivery(id, deliveryPartnerId);
    return successResponse(res, updated, 'Delivery trip reassigned successfully.');
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// 9. CUSTOMER CARE HUB (UNIFIED TICKETING SYSTEM)
// ============================================================================
router.get('/tickets', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { role, status, priority, search } = req.query;
    const tickets = await adminService.listTickets({
      role: role ? String(role) : undefined,
      status: status ? String(status) : undefined,
      priority: priority ? String(priority) : undefined,
      search: search ? String(search) : undefined,
    });
    return successResponse(res, tickets);
  } catch (error) {
    next(error);
  }
});

router.get('/tickets/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const ticket = await adminService.getTicketById(id);
    return successResponse(res, ticket);
  } catch (error) {
    next(error);
  }
});

router.patch('/tickets/:id/assign', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const adminId = req.user!.id;
    const adminName = `${req.user!.firstName || 'Super'} ${req.user!.lastName || 'Admin'}`.trim();
    const updated = await adminService.assignTicket(id, adminId, adminName);
    return successResponse(res, updated, 'Ticket assigned to admin.');
  } catch (error) {
    next(error);
  }
});

router.post('/tickets/:id/messages', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const adminId = req.user!.id;
    const adminName = `${req.user!.firstName || 'Super'} ${req.user!.lastName || 'Admin'}`.trim();
    const { message } = req.body;
    const updated = await adminService.addTicketMessage(id, adminId, adminName, message);
    return successResponse(res, updated, 'Admin reply sent.');
  } catch (error) {
    next(error);
  }
});

router.patch('/tickets/:id/resolve', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const { resolutionNotes } = req.body;
    const updated = await adminService.resolveTicket(id, resolutionNotes || 'Resolved by Administrator');
    return successResponse(res, updated, 'Ticket marked as resolved.');
  } catch (error) {
    next(error);
  }
});

router.patch('/tickets/:id/close', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const updated = await adminService.closeTicket(id);
    return successResponse(res, updated, 'Ticket closed.');
  } catch (error) {
    next(error);
  }
});

export default router;
