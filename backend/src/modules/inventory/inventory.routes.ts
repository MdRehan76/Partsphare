import { Router, Request, Response, NextFunction } from 'express';
import { InventorySyncEngine } from './inventorySync.service';
import { successResponse } from '../../utils/response';
import { authenticate } from '../../middleware/auth.middleware';
import { AuthenticatedRequest } from '../../types';

const router = Router();

// ============================================================================
// EDI & EVENT STREAM ENDPOINTS
// ============================================================================

/**
 * POST /api/inventory/edi/ingest
 * Ingests an EDI 846 Inventory Advice message from external supplier billing / warehouse feeds
 */
router.post('/edi/ingest', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await InventorySyncEngine.processEDISupplierSync(req.body);
    return successResponse(res, result, `EDI 846 inventory sync processed successfully. ${result.processedCount} item(s) updated.`, 200);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/inventory/events
 * Retrieve the chronological inventory audit trail
 */
router.get('/events', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, shopId, eventType, limit } = req.query;
    const events = await InventorySyncEngine.getEvents({
      productId: productId as string,
      shopId: shopId as string,
      eventType: eventType as any,
      limit: limit ? Number(limit) : 50,
    });
    return successResponse(res, events);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/inventory/adjust
 * Authenticated stock adjustment
 */
router.post('/adjust', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { inventoryId, quantity, reason, lowStockThreshold } = req.body;
    const actor = req.user?.role ? `${req.user.role}:${req.user.email}` : 'USER';
    const updated = await InventorySyncEngine.adjustStock(
      inventoryId,
      quantity,
      reason || 'Direct inventory adjustment',
      actor,
      lowStockThreshold
    );
    return successResponse(res, updated, 'Inventory level updated successfully.');
  } catch (error) {
    next(error);
  }
});

export default router;
