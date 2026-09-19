import { PrismaClient, StockMovementType, StockAvailability } from '@prisma/client';
import prisma from '../config/prisma';
import AppError from './AppError';

/**
 * Execute atomic database operations safely with Prisma interactive transactions
 */
export async function executeInTransaction<T>(
  action: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(async (tx) => {
    return await action(tx);
  }, {
    maxWait: 5000,
    timeout: 10000,
  });
}

/**
 * Decrement inventory with atomic negative-inventory checks and stock movement recording
 */
export async function deductInventoryAtomic(
  tx: any,
  inventoryId: string,
  quantityToDeduct: number,
  referenceId: string,
  referenceType = 'ORDER'
) {
  if (quantityToDeduct <= 0) {
    throw AppError.badRequest('Deduct quantity must be greater than zero.');
  }

  // 1. Fetch current inventory row
  const currentInv = await tx.inventory.findUnique({
    where: { id: inventoryId },
  });

  if (!currentInv) {
    throw AppError.notFound('Inventory record not found.');
  }

  if (currentInv.quantity < quantityToDeduct) {
    throw AppError.badRequest(
      `Insufficient stock for item. Available: ${currentInv.quantity}, Requested: ${quantityToDeduct}`
    );
  }

  const newQty = currentInv.quantity - quantityToDeduct;
  const newAvailability = newQty === 0 
    ? StockAvailability.OUT_OF_STOCK 
    : (newQty <= currentInv.lowStockThreshold ? StockAvailability.LOW_STOCK : StockAvailability.IN_STOCK);

  // 2. Update inventory
  const updatedInv = await tx.inventory.update({
    where: { id: inventoryId },
    data: {
      quantity: newQty,
      availabilityStatus: newAvailability,
      isAvailable: newQty > 0,
    },
  });

  // 3. Record StockMovement
  await tx.stockMovement.create({
    data: {
      inventoryId,
      type: StockMovementType.SALE,
      quantity: -quantityToDeduct,
      previousQty: currentInv.quantity,
      newQty,
      reason: `Order fulfillment (${referenceType} #${referenceId})`,
      referenceType,
      referenceId,
    },
  });

  return updatedInv;
}

/**
 * Restore inventory on cancellation or return
 */
export async function restoreInventoryAtomic(
  tx: any,
  inventoryId: string,
  quantityToRestore: number,
  referenceId: string,
  reason = 'Order cancelled'
) {
  const currentInv = await tx.inventory.findUnique({
    where: { id: inventoryId },
  });

  if (!currentInv) return null;

  const newQty = currentInv.quantity + quantityToRestore;
  const newAvailability = newQty <= currentInv.lowStockThreshold 
    ? StockAvailability.LOW_STOCK 
    : StockAvailability.IN_STOCK;

  await tx.inventory.update({
    where: { id: inventoryId },
    data: {
      quantity: newQty,
      availabilityStatus: newAvailability,
      isAvailable: true,
    },
  });

  await tx.stockMovement.create({
    data: {
      inventoryId,
      type: StockMovementType.RETURN,
      quantity: quantityToRestore,
      previousQty: currentInv.quantity,
      newQty,
      reason,
      referenceType: 'RETURN',
      referenceId,
    },
  });
}
