import { Router, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { successResponse, createdResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../types';
import * as procurementService from './procurement.service';

const router = Router();

// ============================================================================
// STRICT RBAC: ALL BULK PROCUREMENT ROUTES REQUIRE ADMIN / SUPER_ADMIN ROLE
// Non-admin roles (CUSTOMER, SHOP_OWNER, DELIVERY_PARTNER) will receive 403 Forbidden!
// ============================================================================
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

// ============================================================================
// 1. DASHBOARD & KPIS
// ============================================================================
router.get('/', async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await procurementService.getDashboardStats();
    return successResponse(res, stats);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// 2. SUPPLIER DIRECTORY
// ============================================================================
router.get('/suppliers', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { search, category, supplierType, status } = req.query;
    const suppliers = await procurementService.listSuppliers({
      search: search ? String(search) : undefined,
      category: category ? String(category) : undefined,
      supplierType: supplierType ? String(supplierType) : undefined,
      status: status ? String(status) : undefined,
    });
    return successResponse(res, suppliers);
  } catch (error) {
    next(error);
  }
});

router.post('/suppliers', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const supplier = await procurementService.createSupplier(req.body, req.user?.id);
    return createdResponse(res, supplier, 'Supplier created successfully.');
  } catch (error) {
    next(error);
  }
});

router.get('/suppliers/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const supplier = await procurementService.getSupplierById(id);
    return successResponse(res, supplier);
  } catch (error) {
    next(error);
  }
});

router.patch('/suppliers/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const updated = await procurementService.updateSupplier(id, req.body, req.user?.id);
    return successResponse(res, updated, 'Supplier updated successfully.');
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// 3. SUPPLIER PART CATALOG & VEHICLE FILTERING
// ============================================================================
router.get('/catalog', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const {
      search,
      supplierId,
      categoryName,
      brandName,
      vehicleMakeId,
      vehicleModelId,
      vehicleType,
      minPrice,
      maxPrice,
      sortBy,
    } = req.query;

    const items = await procurementService.searchCatalog({
      search: search ? String(search) : undefined,
      supplierId: supplierId ? String(supplierId) : undefined,
      categoryName: categoryName ? String(categoryName) : undefined,
      brandName: brandName ? String(brandName) : undefined,
      vehicleMakeId: vehicleMakeId ? String(vehicleMakeId) : undefined,
      vehicleModelId: vehicleModelId ? String(vehicleModelId) : undefined,
      vehicleType: vehicleType ? String(vehicleType) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy: sortBy ? String(sortBy) : undefined,
    });

    return successResponse(res, items);
  } catch (error) {
    next(error);
  }
});

router.post('/catalog', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const item = await procurementService.addCatalogItem(req.body, req.user?.id);
    return createdResponse(res, item, 'Catalog item added successfully.');
  } catch (error) {
    next(error);
  }
});

router.get('/catalog/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const item = await procurementService.getCatalogItemById(id);
    return successResponse(res, item);
  } catch (error) {
    next(error);
  }
});

router.post('/pricing/calculate', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { catalogItemId, quantity } = req.body;
    const calc = await procurementService.calculateBulkPricing(String(catalogItemId), Number(quantity));
    return successResponse(res, calc);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// 4. ADMIN PROCUREMENT CART (ISOLATED FROM CUSTOMER CART)
// ============================================================================
router.get('/cart', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user!.id;
    const cart = await procurementService.getOrCreateProcurementCart(adminId);
    return successResponse(res, cart);
  } catch (error) {
    next(error);
  }
});

router.post('/cart', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user!.id;
    const { catalogItemId, quantity } = req.body;
    const cart = await procurementService.addToProcurementCart(adminId, String(catalogItemId), Number(quantity));
    return successResponse(res, cart, 'Item added to procurement cart.');
  } catch (error) {
    next(error);
  }
});

router.patch('/cart/items/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user!.id;
    const cartItemId = String(req.params.id);
    const { quantity } = req.body;
    const cart = await procurementService.updateCartItemQuantity(adminId, cartItemId, Number(quantity));
    return successResponse(res, cart, 'Cart quantity updated.');
  } catch (error) {
    next(error);
  }
});

router.delete('/cart/items/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user!.id;
    const cartItemId = String(req.params.id);
    const cart = await procurementService.removeFromProcurementCart(adminId, cartItemId);
    return successResponse(res, cart, 'Item removed from cart.');
  } catch (error) {
    next(error);
  }
});

router.delete('/cart', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user!.id;
    const cart = await procurementService.clearProcurementCart(adminId);
    return successResponse(res, cart, 'Procurement cart cleared.');
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// 5. PURCHASE ORDERS & LIFECYCLE
// ============================================================================
router.post('/purchase-orders', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user!.id;
    const po = await procurementService.createPurchaseOrder(adminId, req.body);
    return createdResponse(res, po, 'Purchase Order created successfully.');
  } catch (error) {
    next(error);
  }
});

router.get('/purchase-orders', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { status, supplierId, search, startDate, endDate } = req.query;
    const orders = await procurementService.listPurchaseOrders({
      status: status ? String(status) : undefined,
      supplierId: supplierId ? String(supplierId) : undefined,
      search: search ? String(search) : undefined,
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
    });
    return successResponse(res, orders);
  } catch (error) {
    next(error);
  }
});

router.get('/purchase-orders/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const po = await procurementService.getPurchaseOrderById(id);
    return successResponse(res, po);
  } catch (error) {
    next(error);
  }
});

router.patch('/purchase-orders/:id/status', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const { status, notes } = req.body;
    const updated = await procurementService.updatePurchaseOrderStatus(id, status, notes, req.user?.id);
    return successResponse(res, updated, 'PO status updated successfully.');
  } catch (error) {
    next(error);
  }
});

router.post('/purchase-orders/:id/payment', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const result = await procurementService.recordProcurementPayment(id, req.body, req.user?.id);
    return successResponse(res, result, 'Procurement payment recorded.');
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// 6. GOODS RECEIVED & INVENTORY RESTOCK
// ============================================================================
router.post('/purchase-orders/:id/receive', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const result = await procurementService.receivePurchaseOrderStock(id, req.body, req.user?.id);
    return successResponse(res, result, 'Goods received and shared inventory updated successfully.');
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// 7. HISTORY & MASTER DATA
// ============================================================================
router.get('/history', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { supplierId, status, search, category, startDate, endDate } = req.query;
    const history = await procurementService.getProcurementHistory({
      supplierId: supplierId ? String(supplierId) : undefined,
      status: status ? String(status) : undefined,
      search: search ? String(search) : undefined,
      category: category ? String(category) : undefined,
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
    });
    return successResponse(res, history);
  } catch (error) {
    next(error);
  }
});

router.get('/meta/vehicles', async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const vehicles = await procurementService.getProcurementVehicles();
    return successResponse(res, vehicles);
  } catch (error) {
    next(error);
  }
});

router.get('/meta/categories', async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const categories = await procurementService.getProcurementCategories();
    return successResponse(res, categories);
  } catch (error) {
    next(error);
  }
});

export default router;
