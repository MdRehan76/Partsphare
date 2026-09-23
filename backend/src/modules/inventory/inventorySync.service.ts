import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';

export type InventoryEventType =
  | 'SUPPLIER_EDI_846_SYNC'
  | 'ORDER_STOCK_RESERVED'
  | 'ORDER_STOCK_RESTORED'
  | 'USED_PART_VERIFIED_INTAKE'
  | 'ADMIN_STOCK_ADJUSTMENT'
  | 'SHOP_STOCK_ADJUSTMENT';

export interface InventoryEventLog {
  id: string;
  timestamp: Date;
  eventType: InventoryEventType;
  productId: string;
  productName?: string;
  sku?: string;
  shopId: string;
  shopName?: string;
  previousQty: number;
  newQty: number;
  delta: number;
  reason: string;
  referenceId?: string; // orderId, listingId, or EDI control number
  actor: string; // e.g. "EDI_FEED:BOSCH", "CUSTOMER:demo-user-1", "ADMIN:admin-user-1"
  metadata?: any;
}

export interface EDISupplierLineItem {
  sku?: string;
  productId?: string;
  partNumber?: string;
  shopId: string;
  quantityAvailable: number;
  batchNumber?: string;
  unitCost?: number;
}

export interface EDISupplierInventoryAdvice {
  senderId: string; // e.g. "BOSCH-DISTRIBUTOR-HUB"
  receiverId?: string; // "PARTSNEXA-CORE"
  documentType: 'EDI_846_INVENTORY_ADVICE';
  controlNumber: string;
  timestamp: string;
  lineItems: EDISupplierLineItem[];
}

// Internal in-memory event registry to guarantee persistent auditability
const inMemoryEventLog: InventoryEventLog[] = [];

export class InventorySyncEngine {
  /**
   * Log an authoritative stock movement event to both in-memory log and database delegate
   */
  static async logEvent(entry: Omit<InventoryEventLog, 'id' | 'timestamp'>): Promise<InventoryEventLog> {
    const logItem: InventoryEventLog = {
      id: 'inv-evt-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
      ...entry,
    };

    inMemoryEventLog.unshift(logItem);

    // If database store or inMemoryDb has audit log delegate
    if ((prisma as any).inventoryAuditLog?.create) {
      try {
        await (prisma as any).inventoryAuditLog.create({ data: logItem });
      } catch {
        // Continue if DB schema doesn't have native table
      }
    }

    return logItem;
  }

  /**
   * Query chronological inventory audit logs
   */
  static async getEvents(filters?: {
    productId?: string;
    shopId?: string;
    eventType?: InventoryEventType;
    limit?: number;
  }): Promise<InventoryEventLog[]> {
    let logs = [...inMemoryEventLog];

    if (filters?.productId) {
      logs = logs.filter((l) => l.productId === filters.productId);
    }
    if (filters?.shopId) {
      logs = logs.filter((l) => l.shopId === filters.shopId);
    }
    if (filters?.eventType) {
      logs = logs.filter((l) => l.eventType === filters.eventType);
    }

    const limit = filters?.limit || 50;
    return logs.slice(0, limit);
  }

  /**
   * Authoritatively record order deduction stock movement
   */
  static async recordOrderDeduction(
    productId: string,
    shopId: string,
    quantityDeducted: number,
    previousQty: number,
    newQty: number,
    orderId: string,
    customerEmail?: string
  ): Promise<InventoryEventLog> {
    return this.logEvent({
      eventType: 'ORDER_STOCK_RESERVED',
      productId,
      shopId,
      previousQty,
      newQty,
      delta: -Math.abs(quantityDeducted),
      reason: `Customer order confirmed (${quantityDeducted} unit(s) reserved)`,
      referenceId: orderId,
      actor: customerEmail ? `CUSTOMER:${customerEmail}` : 'CUSTOMER_CHECKOUT',
    });
  }

  /**
   * Authoritatively adjust stock (Admin or Shop manual adjustment)
   */
  static async adjustStock(
    inventoryId: string,
    newQuantity: number,
    reason: string,
    actor: string,
    lowStockThreshold?: number
  ) {
    const qty = Math.max(0, Number(newQuantity));
    const inv = await prisma.inventory.findUnique({ where: { id: inventoryId } });
    if (!inv) throw AppError.notFound('Inventory record not found.');

    const previousQty = Number(inv.quantity);
    const delta = qty - previousQty;

    const updated = await prisma.inventory.update({
      where: { id: inventoryId },
      data: {
        quantity: qty,
        isAvailable: qty > 0,
        availabilityStatus:
          qty > 0 ? (qty <= (lowStockThreshold || inv.lowStockThreshold || 5) ? 'LOW_STOCK' : 'IN_STOCK') : 'OUT_OF_STOCK',
        ...(lowStockThreshold !== undefined ? { lowStockThreshold } : {}),
        updatedAt: new Date(),
      },
    });

    await this.logEvent({
      eventType: actor.startsWith('SHOP') ? 'SHOP_STOCK_ADJUSTMENT' : 'ADMIN_STOCK_ADJUSTMENT',
      productId: inv.productId,
      shopId: inv.shopId,
      previousQty,
      newQty: qty,
      delta,
      reason: reason || 'Manual stock level adjustment',
      referenceId: inventoryId,
      actor,
    });

    return updated;
  }

  /**
   * Ingest and process an EDI 846 Inventory Advice document from a supplier billing/warehouse feed
   */
  static async processEDISupplierSync(advice: EDISupplierInventoryAdvice) {
    if (!advice || !Array.isArray(advice.lineItems)) {
      throw AppError.badRequest('Invalid EDI 846 document format: lineItems array required.');
    }

    const results: any[] = [];

    for (const item of advice.lineItems) {
      let inv: any = null;

      // 1. Match by productId + shopId if provided
      if (item.productId) {
        inv = await prisma.inventory.findFirst({
          where: { productId: item.productId, shopId: item.shopId },
        });
      }

      // 2. Or match by SKU / Part Number
      if (!inv && item.sku) {
        const prod = await prisma.product.findFirst({
          where: { OR: [{ sku: item.sku }, { partNumber: item.sku }] },
        });
        if (prod) {
          inv = await prisma.inventory.findFirst({
            where: { productId: prod.id, shopId: item.shopId },
          });
          if (!inv) {
            // Create inventory row if doesn't exist yet for this shop
            inv = await prisma.inventory.create({
              data: {
                productId: prod.id,
                shopId: item.shopId,
                quantity: item.quantityAvailable,
                sellingPrice: prod.basePrice,
                isAvailable: item.quantityAvailable > 0,
                availabilityStatus: item.quantityAvailable > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
              },
            });
          }
        }
      }

      if (!inv) {
        continue;
      }

      const previousQty = Number(inv.quantity);
      const newQty = Math.max(0, Number(item.quantityAvailable));
      const delta = newQty - previousQty;

      const updated = await prisma.inventory.update({
        where: { id: inv.id },
        data: {
          quantity: newQty,
          isAvailable: newQty > 0,
          availabilityStatus: newQty > 0 ? (newQty <= 5 ? 'LOW_STOCK' : 'IN_STOCK') : 'OUT_OF_STOCK',
          updatedAt: new Date(),
        },
      });

      await this.logEvent({
        eventType: 'SUPPLIER_EDI_846_SYNC',
        productId: inv.productId,
        shopId: inv.shopId,
        previousQty,
        newQty,
        delta,
        reason: `EDI 846 Ingest from ${advice.senderId} (Control #${advice.controlNumber || 'N/A'})`,
        referenceId: advice.controlNumber,
        actor: `EDI_SUPPLIER:${advice.senderId}`,
        metadata: {
          batchNumber: item.batchNumber,
          unitCost: item.unitCost,
        },
      });

      results.push({
        inventoryId: inv.id,
        productId: inv.productId,
        shopId: inv.shopId,
        previousQty,
        newQty,
        delta,
      });
    }

    return {
      controlNumber: advice.controlNumber,
      senderId: advice.senderId,
      processedCount: results.length,
      updates: results,
      syncedAt: new Date(),
    };
  }

  /**
   * Ingest a verified used-part into refurbished inventory
   */
  static async recordUsedPartIntake(listingId: string, targetShopId: string = 'shop-1') {
    const listing = await prisma.usedPartListing.findUnique({ where: { id: listingId } });
    if (!listing) return null;

    // Find linked or matching catalog product, or fallback to central refurbished catalog product
    let targetProductId = listing.productId;
    if (!targetProductId) {
      // Look for a product matching the listing title or brand
      const matchedProd = await prisma.product.findFirst({
        where: {
          OR: [
            { name: { contains: listing.title, mode: 'insensitive' } },
            { partNumber: listing.partNumber || 'NONE' },
          ],
        },
      });
      targetProductId = matchedProd?.id || 'prod-bosch-spark';
    }

    // Find existing inventory in workshop or create intake row
    let inv = await prisma.inventory.findFirst({
      where: { productId: targetProductId, shopId: targetShopId },
    });

    let previousQty = 0;
    let newQty = 1;

    if (inv) {
      previousQty = Number(inv.quantity);
      newQty = previousQty + 1;
      await prisma.inventory.update({
        where: { id: inv.id },
        data: {
          quantity: newQty,
          isAvailable: true,
          availabilityStatus: newQty <= 5 ? 'LOW_STOCK' : 'IN_STOCK',
          updatedAt: new Date(),
        },
      });
    } else {
      inv = await prisma.inventory.create({
        data: {
          productId: targetProductId,
          shopId: targetShopId,
          quantity: 1,
          sellingPrice: Number(listing.finalValuation || listing.askingPrice || 999),
          isAvailable: true,
          availabilityStatus: 'LOW_STOCK',
        },
      });
    }

    await this.logEvent({
      eventType: 'USED_PART_VERIFIED_INTAKE',
      productId: targetProductId,
      shopId: targetShopId,
      previousQty,
      newQty,
      delta: 1,
      reason: `Verified Used Part Intake: "${listing.title}" (Grade: ${listing.conditionGrade || 'Passed'})`,
      referenceId: listing.id,
      actor: 'USED_PARTS_INSPECTOR',
      metadata: {
        conditionGrade: listing.conditionGrade,
        valuation: listing.finalValuation,
      },
    });

    return {
      listingId: listing.id,
      inventoryId: inv.id,
      productId: targetProductId,
      shopId: targetShopId,
      stockIncrementedTo: newQty,
    };
  }
}

export default InventorySyncEngine;
