import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';
import InventorySyncEngine from '../inventory/inventorySync.service';
import { StockMovementType, StockAvailability } from '@prisma/client';

export interface BulkPriceCalcResult {
  catalogItemId: string;
  regularUnitPrice: number;
  effectiveUnitPrice: number;
  quantity: number;
  subtotal: number;
  bulkDiscount: number;
  total: number;
  appliedTier: any | null;
  moq: number;
}

/**
 * Authoritative Backend Bulk Pricing Calculation Engine
 * Section 11: "The backend must calculate: Unit Price x Quantity = Subtotal. Apply applicable bulk tier."
 */
export async function calculateBulkPricing(catalogItemId: string, quantity: number): Promise<BulkPriceCalcResult> {
  const item = await prisma.supplierCatalogItem.findUnique({
    where: { id: catalogItemId },
    include: {
      bulkPriceTiers: {
        orderBy: { minQuantity: 'asc' },
      },
    },
  });

  if (!item) {
    throw AppError.notFound(`Supplier catalog item ${catalogItemId} not found.`);
  }

  const regularUnitPrice = Number(item.unitPrice);
  const moq = item.moq || 1;
  const qty = Math.max(1, Number(quantity));

  // Find the highest applicable tier
  let appliedTier: any = null;
  for (const tier of item.bulkPriceTiers) {
    if (qty >= tier.minQuantity) {
      if (tier.maxQuantity === null || qty <= tier.maxQuantity) {
        appliedTier = tier;
        break;
      }
    }
  }

  // If quantity matches beyond highest defined tier, pick the highest tier
  if (!appliedTier && item.bulkPriceTiers.length > 0) {
    const highestTier = item.bulkPriceTiers[item.bulkPriceTiers.length - 1];
    if (qty >= highestTier.minQuantity) {
      appliedTier = highestTier;
    }
  }

  const effectiveUnitPrice = appliedTier ? Number(appliedTier.unitPrice) : regularUnitPrice;
  const subtotal = regularUnitPrice * qty;
  const total = effectiveUnitPrice * qty;
  const bulkDiscount = Math.max(0, subtotal - total);

  return {
    catalogItemId,
    regularUnitPrice,
    effectiveUnitPrice,
    quantity: qty,
    subtotal,
    bulkDiscount,
    total,
    appliedTier,
    moq,
  };
}

/**
 * Bulk Procurement Dashboard Statistics
 * Section 2: Total Suppliers, Active Suppliers, Pending POs, In Transit, Received This Month, Spend, Units Purchased
 */
export async function getDashboardStats() {
  const [
    totalSuppliers,
    activeSuppliers,
    pendingPOsCount,
    inTransitCount,
    allPOs,
    allPOItems,
    recentPOs,
    lowStockInventories,
  ] = await Promise.all([
    prisma.supplier.count(),
    prisma.supplier.count({ where: { isActive: true } }),
    prisma.purchaseOrder.count({
      where: { status: { in: ['DRAFT', 'SUBMITTED', 'SUPPLIER_CONFIRMED', 'PROCESSING'] } },
    }),
    prisma.purchaseOrder.count({
      where: { status: { in: ['SHIPPED', 'IN_TRANSIT'] } },
    }),
    prisma.purchaseOrder.findMany({
      select: {
        id: true,
        status: true,
        totalCost: true,
        updatedAt: true,
        createdAt: true,
      },
    }),
    prisma.purchaseOrderItem.findMany({
      select: {
        orderedQuantity: true,
        receivedQuantity: true,
      },
    }),
    prisma.purchaseOrder.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        supplier: {
          select: { id: true, name: true, slug: true, supplierType: true, city: true },
        },
        items: true,
      },
    }),
    prisma.inventory.findMany({
      where: {
        quantity: { lte: 25 },
      },
      take: 8,
      include: {
        product: {
          include: {
            brandRel: true,
            category: true,
            supplierCatalogItems: {
              take: 2,
              include: { supplier: true },
            },
          },
        },
      },
    }),
  ]);

  // Current month calculation
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const receivedThisMonth = allPOs.filter((po) => {
    return (
      ['PARTIALLY_RECEIVED', 'RECEIVED', 'COMPLETED'].includes(po.status) &&
      new Date(po.updatedAt) >= startOfMonth
    );
  }).length;

  const totalProcurementSpend = allPOs
    .filter((po) => po.status !== 'CANCELLED')
    .reduce((sum, po) => sum + Number(po.totalCost), 0);

  const unitsPurchased = allPOItems.reduce((sum, item) => sum + item.receivedQuantity, 0);
  const unitsOrdered = allPOItems.reduce((sum, item) => sum + item.orderedQuantity, 0);

  // Group low stock products with reorder suggestion
  const lowStockAlerts = lowStockInventories.map((inv) => {
    const defaultCatalogItem = inv.product.supplierCatalogItems[0] || null;
    return {
      inventoryId: inv.id,
      productId: inv.productId,
      productName: inv.product.name,
      sku: inv.product.sku,
      currentStock: inv.quantity,
      reorderThreshold: inv.lowStockThreshold || 10,
      isBelowReorderLevel: inv.quantity <= (inv.lowStockThreshold || 10),
      category: inv.product.category.name,
      suggestedSupplier: defaultCatalogItem?.supplier?.name || 'Bosch Automotive Hub',
      suggestedCatalogItemId: defaultCatalogItem?.id || null,
      suggestedMoq: defaultCatalogItem?.moq || 10,
      suggestedBulkPrice: defaultCatalogItem ? Number(defaultCatalogItem.bulkPrice) : Number(inv.sellingPrice) * 0.75,
    };
  });

  return {
    totalSuppliers,
    activeSuppliers,
    pendingPurchaseOrders: pendingPOsCount,
    ordersInTransit: inTransitCount,
    receivedThisMonth,
    totalProcurementSpend,
    unitsPurchased,
    unitsOrdered,
    recentPurchaseOrders: recentPOs,
    lowStockAlerts,
    hasActivity: allPOs.length > 0 || totalSuppliers > 0,
  };
}

/**
 * Supplier Directory Management
 * Section 3, 23: List, Filter, Create, Edit suppliers
 */
export async function listSuppliers(filters?: {
  search?: string;
  category?: string;
  supplierType?: string;
  status?: string;
}) {
  const where: any = {};

  if (filters?.status === 'ACTIVE') {
    where.isActive = true;
  } else if (filters?.status === 'INACTIVE') {
    where.isActive = false;
  }

  if (filters?.supplierType && filters.supplierType !== 'ALL') {
    where.supplierType = filters.supplierType;
  }

  if (filters?.category && filters.category !== 'ALL') {
    where.categories = { has: filters.category };
  }

  if (filters?.search) {
    const q = filters.search.trim();
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { contactPerson: { contains: q, mode: 'insensitive' } },
      { city: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
    ];
  }

  const suppliers = await prisma.supplier.findMany({
    where,
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          catalogItems: true,
          purchaseOrders: true,
        },
      },
    },
  });

  return suppliers;
}

export async function getSupplierById(id: string) {
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      catalogItems: {
        include: {
          bulkPriceTiers: { orderBy: { minQuantity: 'asc' } },
          brand: true,
          vehicleMake: true,
          vehicleModel: true,
          vehicleVariant: true,
          product: {
            include: { inventories: true },
          },
        },
        orderBy: { partName: 'asc' },
      },
      purchaseOrders: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      },
    },
  });

  if (!supplier) {
    throw AppError.notFound(`Supplier with ID ${id} not found.`);
  }

  // Summary statistics for supplier
  const totalOrders = supplier.purchaseOrders.length;
  const totalSpend = supplier.purchaseOrders
    .filter((po) => po.status !== 'CANCELLED')
    .reduce((sum, po) => sum + Number(po.totalCost), 0);

  return {
    ...supplier,
    stats: {
      totalItemsInCatalog: supplier.catalogItems.length,
      totalPurchaseOrders: totalOrders,
      totalSpend,
      fulfillmentRate: 98.4,
    },
  };
}

export async function createSupplier(data: any, adminId?: string) {
  const slug =
    data.slug ||
    data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const supplier = await prisma.supplier.create({
    data: {
      name: data.name,
      slug,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      gstNumber: data.gstNumber || null,
      supplierType: data.supplierType || 'DISTRIBUTOR',
      logoUrl: data.logoUrl || null,
      categories: Array.isArray(data.categories) ? data.categories : [],
      supportedVehicles: Array.isArray(data.supportedVehicles) ? data.supportedVehicles : ['4 Wheeler'],
      verificationStatus: data.verificationStatus || 'VERIFIED',
      isDemo: true,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    },
  });

  // Section 35: Audit Log entry
  await prisma.auditLog.create({
    data: {
      userId: adminId,
      action: 'SUPPLIER_CREATED',
      entityType: 'Supplier',
      entityId: supplier.id,
      changes: { name: supplier.name, slug: supplier.slug, type: supplier.supplierType },
    },
  });

  return supplier;
}

export async function updateSupplier(id: string, data: any, adminId?: string) {
  const updated = await prisma.supplier.update({
    where: { id },
    data: {
      name: data.name,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      gstNumber: data.gstNumber,
      supplierType: data.supplierType,
      logoUrl: data.logoUrl,
      categories: data.categories,
      supportedVehicles: data.supportedVehicles,
      verificationStatus: data.verificationStatus,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : undefined,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: adminId,
      action: 'SUPPLIER_UPDATED',
      entityType: 'Supplier',
      entityId: id,
      changes: data,
    },
  });

  return updated;
}

/**
 * Supplier Part Catalog Search & Vehicle Filtering
 * Sections 7, 8, 9, 10
 */
export async function searchCatalog(filters?: {
  search?: string;
  supplierId?: string;
  categoryName?: string;
  brandName?: string;
  vehicleMakeId?: string;
  vehicleModelId?: string;
  vehicleType?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
}) {
  const where: any = { isAvailable: true };

  if (filters?.supplierId && filters.supplierId !== 'ALL') {
    where.supplierId = filters.supplierId;
  }

  if (filters?.categoryName && filters.categoryName !== 'ALL') {
    where.categoryName = filters.categoryName;
  }

  if (filters?.brandName && filters.brandName !== 'ALL') {
    where.brandName = filters.brandName;
  }

  if (filters?.vehicleMakeId && filters.vehicleMakeId !== 'ALL') {
    where.vehicleMakeId = filters.vehicleMakeId;
  }

  if (filters?.vehicleModelId && filters.vehicleModelId !== 'ALL') {
    where.vehicleModelId = filters.vehicleModelId;
  }

  if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
    where.unitPrice = {};
    if (filters.minPrice !== undefined) where.unitPrice.gte = Number(filters.minPrice);
    if (filters.maxPrice !== undefined) where.unitPrice.lte = Number(filters.maxPrice);
  }

  if (filters?.search) {
    const q = filters.search.trim();
    where.OR = [
      { partName: { contains: q, mode: 'insensitive' } },
      { partNumber: { contains: q, mode: 'insensitive' } },
      { brandName: { contains: q, mode: 'insensitive' } },
      { vehicleMakeName: { contains: q, mode: 'insensitive' } },
      { vehicleModelName: { contains: q, mode: 'insensitive' } },
      { supplier: { name: { contains: q, mode: 'insensitive' } } },
    ];
  }

  // Sorting
  let orderBy: any = { partName: 'asc' };
  switch (filters?.sortBy) {
    case 'unit_price_asc':
      orderBy = { unitPrice: 'asc' };
      break;
    case 'unit_price_desc':
      orderBy = { unitPrice: 'desc' };
      break;
    case 'bulk_price_asc':
      orderBy = { bulkPrice: 'asc' };
      break;
    case 'stock_desc':
      orderBy = { stockQuantity: 'desc' };
      break;
    case 'lead_time_asc':
      orderBy = { leadTimeDays: 'asc' };
      break;
    case 'supplier_name':
      orderBy = { supplier: { name: 'asc' } };
      break;
    default:
      orderBy = { partName: 'asc' };
  }

  const items = await prisma.supplierCatalogItem.findMany({
    where,
    orderBy,
    include: {
      supplier: {
        select: {
          id: true,
          name: true,
          slug: true,
          supplierType: true,
          city: true,
          logoUrl: true,
          verificationStatus: true,
        },
      },
      bulkPriceTiers: { orderBy: { minQuantity: 'asc' } },
      brand: true,
      vehicleMake: true,
      vehicleModel: true,
      vehicleVariant: true,
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          inventories: {
            select: { id: true, quantity: true, isAvailable: true, sellingPrice: true },
          },
        },
      },
    },
  });

  return items;
}

/**
 * Catalog Item Detail & Supplier Comparison Engine
 * Section 32: Supplier Comparison for the same/similar parts
 */
export async function getCatalogItemById(id: string) {
  const item = await prisma.supplierCatalogItem.findUnique({
    where: { id },
    include: {
      supplier: true,
      bulkPriceTiers: { orderBy: { minQuantity: 'asc' } },
      brand: true,
      vehicleMake: true,
      vehicleModel: true,
      vehicleVariant: true,
      product: {
        include: {
          inventories: true,
        },
      },
    },
  });

  if (!item) {
    throw AppError.notFound(`Catalog item ${id} not found.`);
  }

  // Find comparable alternatives from other suppliers for the same category & compatible vehicle
  const comparableOptions = await prisma.supplierCatalogItem.findMany({
    where: {
      id: { not: id },
      categoryName: item.categoryName,
      vehicleModelName: item.vehicleModelName,
      isAvailable: true,
    },
    take: 5,
    include: {
      supplier: {
        select: { id: true, name: true, slug: true, supplierType: true, city: true },
      },
      bulkPriceTiers: { orderBy: { minQuantity: 'asc' } },
    },
  });

  return {
    ...item,
    comparableOptions,
  };
}

/**
 * Add Part to Supplier Catalog
 * Section 24
 */
export async function addCatalogItem(data: any, adminId?: string) {
  const item = await prisma.supplierCatalogItem.create({
    data: {
      supplierId: data.supplierId,
      productId: data.productId || null,
      partName: data.partName,
      partNumber: data.partNumber,
      categoryName: data.categoryName,
      categoryId: data.categoryId || null,
      brandId: data.brandId || null,
      brandName: data.brandName,
      vehicleMakeId: data.vehicleMakeId || null,
      vehicleMakeName: data.vehicleMakeName,
      vehicleModelId: data.vehicleModelId || null,
      vehicleModelName: data.vehicleModelName,
      vehicleVariantId: data.vehicleVariantId || null,
      variantName: data.variantName || null,
      year: data.year ? Number(data.year) : 2023,
      condition: data.condition || 'GENUINE_NEW',
      unitPrice: Number(data.unitPrice),
      bulkPrice: Number(data.bulkPrice || data.unitPrice * 0.85),
      moq: Number(data.moq || 10),
      stockQuantity: Number(data.stockQuantity || 500),
      warranty: data.warranty || '12 Months Manufacturer Warranty',
      leadTime: data.leadTime || '3–5 days',
      leadTimeDays: Number(data.leadTimeDays || 3),
      imageUrl: data.imageUrl || null,
      isAvailable: true,
      bulkPriceTiers: {
        create: Array.isArray(data.bulkPriceTiers)
          ? data.bulkPriceTiers.map((t: any) => ({
              minQuantity: Number(t.minQuantity),
              maxQuantity: t.maxQuantity ? Number(t.maxQuantity) : null,
              unitPrice: Number(t.unitPrice),
              discountPercent: t.discountPercent ? Number(t.discountPercent) : null,
            }))
          : [
              { minQuantity: 1, maxQuantity: Number(data.moq || 10) - 1, unitPrice: Number(data.unitPrice) },
              { minQuantity: Number(data.moq || 10), maxQuantity: null, unitPrice: Number(data.bulkPrice || data.unitPrice * 0.85) },
            ],
      },
    },
    include: {
      bulkPriceTiers: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: adminId,
      action: 'SUPPLIER_CATALOG_ITEM_ADDED',
      entityType: 'SupplierCatalogItem',
      entityId: item.id,
      changes: { partName: item.partName, partNumber: item.partNumber, supplierId: item.supplierId },
    },
  });

  return item;
}

/**
 * Isolated Admin Procurement Cart
 * Section 12: Completely isolated from Customer shopping cart!
 */
export async function getOrCreateProcurementCart(adminId: string) {
  let cart = await prisma.procurementCart.findUnique({
    where: { adminId },
    include: {
      items: {
        include: {
          catalogItem: {
            include: {
              supplier: {
                select: { id: true, name: true, slug: true, email: true, phone: true, city: true },
              },
              bulkPriceTiers: { orderBy: { minQuantity: 'asc' } },
            },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.procurementCart.create({
      data: { adminId },
      include: {
        items: {
          include: {
            catalogItem: {
              include: {
                supplier: {
                  select: { id: true, name: true, slug: true, email: true, phone: true, city: true },
                },
                bulkPriceTiers: { orderBy: { minQuantity: 'asc' } },
              },
            },
          },
        },
      },
    });
  }

  // Recalculate authoritative bulk pricing for all items in cart
  let subtotal = 0;
  let totalBulkDiscount = 0;
  let totalEffectiveCost = 0;

  const processedItems = cart.items.map((item) => {
    const qty = Number(item.quantity);
    const regularUnitPrice = Number(item.catalogItem.unitPrice);

    // Find applicable tier
    let appliedTier: any = null;
    for (const tier of item.catalogItem.bulkPriceTiers) {
      if (qty >= tier.minQuantity) {
        if (tier.maxQuantity === null || qty <= tier.maxQuantity) {
          appliedTier = tier;
          break;
        }
      }
    }
    if (!appliedTier && item.catalogItem.bulkPriceTiers.length > 0) {
      const highestTier = item.catalogItem.bulkPriceTiers[item.catalogItem.bulkPriceTiers.length - 1];
      if (qty >= highestTier.minQuantity) appliedTier = highestTier;
    }

    const effectiveUnitPrice = appliedTier ? Number(appliedTier.unitPrice) : regularUnitPrice;
    const itemSubtotal = regularUnitPrice * qty;
    const itemTotal = effectiveUnitPrice * qty;
    const itemDiscount = itemSubtotal - itemTotal;

    subtotal += itemSubtotal;
    totalBulkDiscount += itemDiscount;
    totalEffectiveCost += itemTotal;

    return {
      ...item,
      regularUnitPrice,
      effectiveUnitPrice,
      itemSubtotal,
      itemDiscount,
      itemTotal,
      appliedTier,
    };
  });

  // Configurable Taxes & Logistics (Section 34)
  const taxRate = 0.18; // 18% GST standard on automotive spare parts
  const tax = Number((totalEffectiveCost * taxRate).toFixed(2));
  const shipping = totalEffectiveCost > 0 ? (totalEffectiveCost > 50000 ? 0 : 1500) : 0;
  const handling = totalEffectiveCost > 0 ? 300 : 0;
  const grandTotal = totalEffectiveCost + tax + shipping + handling;

  return {
    cartId: cart.id,
    adminId: cart.adminId,
    itemCount: processedItems.length,
    items: processedItems,
    financialSummary: {
      subtotal,
      bulkDiscount: totalBulkDiscount,
      netProcurementCost: totalEffectiveCost,
      tax,
      shipping,
      handling,
      grandTotal,
    },
  };
}

export async function addToProcurementCart(adminId: string, catalogItemId: string, quantity: number) {
  const cartWrapper = await getOrCreateProcurementCart(adminId);
  const cartId = cartWrapper.cartId;

  const item = await prisma.supplierCatalogItem.findUnique({
    where: { id: catalogItemId },
    include: { bulkPriceTiers: true },
  });

  if (!item) {
    throw AppError.notFound(`Supplier catalog item ${catalogItemId} not found.`);
  }

  const qty = Math.max(item.moq || 1, Number(quantity));
  const priceResult = await calculateBulkPricing(catalogItemId, qty);

  const existingCartItem = await prisma.procurementCartItem.findUnique({
    where: { cartId_catalogItemId: { cartId, catalogItemId } },
  });

  if (existingCartItem) {
    const updatedQty = existingCartItem.quantity + qty;
    const recalculated = await calculateBulkPricing(catalogItemId, updatedQty);
    await prisma.procurementCartItem.update({
      where: { id: existingCartItem.id },
      data: {
        quantity: updatedQty,
        unitPrice: recalculated.effectiveUnitPrice,
        bulkDiscount: recalculated.bulkDiscount,
        subtotal: recalculated.total,
      },
    });
  } else {
    await prisma.procurementCartItem.create({
      data: {
        cartId,
        catalogItemId,
        quantity: qty,
        unitPrice: priceResult.effectiveUnitPrice,
        bulkDiscount: priceResult.bulkDiscount,
        subtotal: priceResult.total,
      },
    });
  }

  return getOrCreateProcurementCart(adminId);
}

export async function updateCartItemQuantity(adminId: string, cartItemId: string, quantity: number) {
  const cartItem = await prisma.procurementCartItem.findUnique({
    where: { id: cartItemId },
    include: { catalogItem: true },
  });

  if (!cartItem) {
    throw AppError.notFound(`Cart item ${cartItemId} not found.`);
  }

  const minAllowed = cartItem.catalogItem.moq || 1;
  const newQty = Math.max(minAllowed, Number(quantity));

  const recalculated = await calculateBulkPricing(cartItem.catalogItemId, newQty);

  await prisma.procurementCartItem.update({
    where: { id: cartItemId },
    data: {
      quantity: newQty,
      unitPrice: recalculated.effectiveUnitPrice,
      bulkDiscount: recalculated.bulkDiscount,
      subtotal: recalculated.total,
    },
  });

  return getOrCreateProcurementCart(adminId);
}

export async function removeFromProcurementCart(adminId: string, cartItemId: string) {
  await prisma.procurementCartItem.delete({
    where: { id: cartItemId },
  });
  return getOrCreateProcurementCart(adminId);
}

export async function clearProcurementCart(adminId: string) {
  const cart = await prisma.procurementCart.findUnique({ where: { adminId } });
  if (cart) {
    await prisma.procurementCartItem.deleteMany({ where: { cartId: cart.id } });
  }
  return getOrCreateProcurementCart(adminId);
}

/**
 * Purchase Order Lifecycle Engine
 * Sections 13, 14, 15: Create PO, Track PO, Update Status, Record Payment
 */
export async function createPurchaseOrder(
  adminId: string,
  options?: {
    supplierId?: string;
    catalogItemId?: string;
    quantity?: number;
    paymentMethod?: string;
    notes?: string;
    expectedDays?: number;
  }
) {
  const year = new Date().getFullYear();
  const count = await prisma.purchaseOrder.count();
  const poSequence = String(count + 1).padStart(4, '0');
  const poNumber = `PO-PNX-${year}-${poSequence}`;

  // Flow A: Direct quick-order from Low Stock or Supplier Comparison
  if (options?.catalogItemId && options?.quantity) {
    const item = await prisma.supplierCatalogItem.findUnique({
      where: { id: options.catalogItemId },
      include: { supplier: true, bulkPriceTiers: true },
    });

    if (!item) throw AppError.notFound(`Catalog item ${options.catalogItemId} not found.`);

    const qty = Math.max(item.moq || 1, Number(options.quantity));
    const calc = await calculateBulkPricing(item.id, qty);

    const tax = Number((calc.total * 0.18).toFixed(2));
    const shipping = calc.total > 50000 ? 0 : 1500;
    const handling = 300;
    const grandTotal = calc.total + tax + shipping + handling;

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        supplierId: item.supplierId,
        adminId,
        status: 'SUBMITTED',
        subtotal: calc.subtotal,
        bulkDiscount: calc.bulkDiscount,
        tax,
        shipping,
        handling,
        totalCost: grandTotal,
        paymentMethod: options.paymentMethod || 'DEMO_PAYMENT',
        paymentStatus: 'PENDING',
        notes: options.notes || `Direct Procurement PO for ${item.partName}`,
        expectedDelivery: new Date(Date.now() + (options.expectedDays || item.leadTimeDays || 4) * 86400000),
        items: {
          create: [
            {
              catalogItemId: item.id,
              productId: item.productId,
              partName: item.partName,
              partNumber: item.partNumber,
              brandName: item.brandName,
              vehicleCompatibility: `${item.vehicleMakeName} ${item.vehicleModelName}`,
              orderedQuantity: qty,
              receivedQuantity: 0,
              unitPrice: calc.effectiveUnitPrice,
              bulkDiscount: calc.bulkDiscount,
              totalCost: calc.total,
            },
          ],
        },
      },
      include: { items: true, supplier: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'PURCHASE_ORDER_CREATED',
        entityType: 'PurchaseOrder',
        entityId: po.id,
        changes: { poNumber: po.poNumber, supplierId: po.supplierId, totalCost: grandTotal },
      },
    });

    return po;
  }

  // Flow B: Create PO from Admin Procurement Cart
  const cartWrapper = await getOrCreateProcurementCart(adminId);
  if (cartWrapper.items.length === 0) {
    throw AppError.badRequest('Procurement cart is empty. Add parts before creating a Purchase Order.');
  }

  // Group items by supplier so each supplier gets their dedicated PO
  const itemsBySupplier = new Map<string, any[]>();
  for (const it of cartWrapper.items) {
    const sId = it.catalogItem.supplierId;
    if (!itemsBySupplier.has(sId)) itemsBySupplier.set(sId, []);
    itemsBySupplier.get(sId)?.push(it);
  }

  const createdPOs: any[] = [];
  let seqOffset = 0;

  for (const [supplierId, supplierItems] of itemsBySupplier.entries()) {
    const num = `PO-PNX-${year}-${String(count + 1 + seqOffset).padStart(4, '0')}`;
    seqOffset++;

    let subtotal = 0;
    let bulkDiscount = 0;
    let netCost = 0;

    for (const sit of supplierItems) {
      subtotal += sit.itemSubtotal;
      bulkDiscount += sit.itemDiscount;
      netCost += sit.itemTotal;
    }

    const tax = Number((netCost * 0.18).toFixed(2));
    const shipping = netCost > 50000 ? 0 : 1500;
    const handling = 300;
    const totalCost = netCost + tax + shipping + handling;

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber: num,
        supplierId,
        adminId,
        status: 'SUBMITTED',
        subtotal,
        bulkDiscount,
        tax,
        shipping,
        handling,
        totalCost,
        paymentMethod: options?.paymentMethod || 'DEMO_PAYMENT',
        paymentStatus: 'PENDING',
        notes: options?.notes || 'B2B Bulk Procurement order generated from Cart',
        expectedDelivery: new Date(Date.now() + 4 * 86400000),
        items: {
          create: supplierItems.map((sit) => ({
            catalogItemId: sit.catalogItemId,
            productId: sit.catalogItem.productId,
            partName: sit.catalogItem.partName,
            partNumber: sit.catalogItem.partNumber,
            brandName: sit.catalogItem.brandName,
            vehicleCompatibility: `${sit.catalogItem.vehicleMakeName} ${sit.catalogItem.vehicleModelName}`,
            orderedQuantity: sit.quantity,
            receivedQuantity: 0,
            unitPrice: sit.effectiveUnitPrice,
            bulkDiscount: sit.itemDiscount,
            totalCost: sit.itemTotal,
          })),
        },
      },
      include: { items: true, supplier: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'PURCHASE_ORDER_CREATED',
        entityType: 'PurchaseOrder',
        entityId: po.id,
        changes: { poNumber: po.poNumber, supplierId, totalCost },
      },
    });

    createdPOs.push(po);
  }

  // Clear procurement cart after PO creation
  await clearProcurementCart(adminId);

  return createdPOs.length === 1 ? createdPOs[0] : createdPOs;
}

export async function listPurchaseOrders(filters?: {
  status?: string;
  supplierId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}) {
  const where: any = {};

  if (filters?.status && filters.status !== 'ALL') {
    where.status = filters.status;
  }

  if (filters?.supplierId && filters.supplierId !== 'ALL') {
    where.supplierId = filters.supplierId;
  }

  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
    if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
  }

  if (filters?.search) {
    const q = filters.search.trim();
    where.OR = [
      { poNumber: { contains: q, mode: 'insensitive' } },
      { supplier: { name: { contains: q, mode: 'insensitive' } } },
      { items: { some: { partNumber: { contains: q, mode: 'insensitive' } } } },
      { items: { some: { partName: { contains: q, mode: 'insensitive' } } } },
    ];
  }

  const pos = await prisma.purchaseOrder.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      supplier: {
        select: { id: true, name: true, slug: true, email: true, phone: true, city: true, supplierType: true },
      },
      items: true,
      goodsReceipts: true,
      payments: true,
    },
  });

  return pos;
}

export async function getPurchaseOrderById(id: string) {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      supplier: true,
      items: {
        include: {
          catalogItem: {
            include: { product: true },
          },
        },
      },
      goodsReceipts: {
        include: {
          items: true,
        },
      },
      payments: true,
    },
  });

  if (!po) {
    throw AppError.notFound(`Purchase order ${id} not found.`);
  }

  return po;
}

export async function updatePurchaseOrderStatus(id: string, newStatus: string, notes?: string, adminId?: string) {
  const po = await prisma.purchaseOrder.findUnique({ where: { id } });
  if (!po) throw AppError.notFound(`Purchase order ${id} not found.`);

  const validStatuses = [
    'DRAFT',
    'SUBMITTED',
    'SUPPLIER_CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'IN_TRANSIT',
    'PARTIALLY_RECEIVED',
    'RECEIVED',
    'COMPLETED',
    'CANCELLED',
  ];

  if (!validStatuses.includes(newStatus)) {
    throw AppError.badRequest(`Invalid status '${newStatus}'. Allowed: ${validStatuses.join(', ')}`);
  }

  const updated = await prisma.purchaseOrder.update({
    where: { id },
    data: {
      status: newStatus,
      notes: notes ? `${po.notes ? po.notes + ' | ' : ''}${notes}` : po.notes,
      ...(newStatus === 'COMPLETED' ? { receivedAt: new Date() } : {}),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: adminId,
      action: 'PO_STATUS_CHANGED',
      entityType: 'PurchaseOrder',
      entityId: id,
      changes: { from: po.status, to: newStatus, notes },
    },
  });

  return updated;
}

export async function recordProcurementPayment(
  poId: string,
  paymentData: {
    amount: number;
    paymentMethod: string;
    paymentStatus: string;
    reference?: string;
    invoiceNumber?: string;
    notes?: string;
  },
  adminId?: string
) {
  const po = await prisma.purchaseOrder.findUnique({ where: { id: poId } });
  if (!po) throw AppError.notFound(`Purchase order ${poId} not found.`);

  const payment = await prisma.procurementPayment.create({
    data: {
      purchaseOrderId: poId,
      amount: Number(paymentData.amount),
      paymentMethod: paymentData.paymentMethod || 'DEMO_PAYMENT',
      paymentStatus: paymentData.paymentStatus || 'PAID',
      reference: paymentData.reference || null,
      invoiceNumber: paymentData.invoiceNumber || null,
      notes: paymentData.notes || null,
      paidAt: paymentData.paymentStatus === 'PAID' ? new Date() : null,
    },
  });

  const updatedPo = await prisma.purchaseOrder.update({
    where: { id: poId },
    data: {
      paymentStatus: paymentData.paymentStatus,
      paymentMethod: paymentData.paymentMethod,
      supplierInvoice: paymentData.invoiceNumber || po.supplierInvoice,
      paymentReference: paymentData.reference || po.paymentReference,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: adminId,
      action: 'PROCUREMENT_PAYMENT_MARKED',
      entityType: 'PurchaseOrder',
      entityId: poId,
      changes: paymentData,
    },
  });

  return { payment, purchaseOrder: updatedPo };
}

/**
 * GOODS RECEIVED FLOW & INVENTORY INTEGRATION
 * Sections 16, 17, 18, 19, 20
 * Authoritatively increases PostgreSQL Inventory, creates StockMovement record,
 * creates GoodsReceipt / GoodsReceiptItem, and triggers EDI inventory sync event!
 */
export async function receivePurchaseOrderStock(
  purchaseOrderId: string,
  data: {
    items: Array<{ poItemId: string; quantityToReceive: number }>;
    carrier?: string;
    trackingNumber?: string;
    notes?: string;
  },
  adminId?: string
) {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id: purchaseOrderId },
    include: {
      supplier: true,
      items: {
        include: {
          catalogItem: true,
          product: {
            include: { inventories: true },
          },
        },
      },
    },
  });

  if (!po) {
    throw AppError.notFound(`Purchase order ${purchaseOrderId} not found.`);
  }

  if (po.status === 'CANCELLED') {
    throw AppError.badRequest('Cannot receive goods for a cancelled purchase order.');
  }

  if (po.status === 'COMPLETED' || po.status === 'RECEIVED') {
    throw AppError.badRequest('This purchase order is already marked fully received.');
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw AppError.badRequest('No item quantities provided to receive.');
  }

  // Find primary shop (central hub) for shared inventory
  const defaultShop = await prisma.shop.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  });

  if (!defaultShop) {
    throw AppError.internal('No active Central Workshop / Hub found to receive inventory.');
  }

  // Generate Goods Receipt Number (GRN)
  const grnCount = await prisma.goodsReceipt.count();
  const receiptNumber = `GRN-${new Date().getFullYear()}-${String(grnCount + 1).padStart(4, '0')}`;

  // Execute in Prisma transaction for strict ACID compliance
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create Goods Receipt header
    const goodsReceipt = await tx.goodsReceipt.create({
      data: {
        receiptNumber,
        purchaseOrderId: po.id,
        receivedByAdminId: adminId || null,
        carrier: data.carrier || 'Dedicated Supplier Fleet',
        trackingNumber: data.trackingNumber || `INBOUND-${Date.now().toString().slice(-6)}`,
        notes: data.notes || `Stock received for ${po.poNumber}`,
      },
    });

    const receivedItemsSummary: any[] = [];

    // 2. Process each received item
    for (const receivedItem of data.items) {
      const poItem = po.items.find((item) => item.id === receivedItem.poItemId);
      if (!poItem) {
        throw AppError.badRequest(`Purchase order item ${receivedItem.poItemId} not found on this PO.`);
      }

      const qtyToReceive = Math.max(0, Number(receivedItem.quantityToReceive));
      if (qtyToReceive <= 0) continue;

      const remainingAllowed = poItem.orderedQuantity - poItem.receivedQuantity;
      if (qtyToReceive > remainingAllowed) {
        throw AppError.badRequest(
          `Cannot receive ${qtyToReceive} units for '${poItem.partName}'. Only ${remainingAllowed} unit(s) remaining on PO.`
        );
      }

      const newReceivedQty = poItem.receivedQuantity + qtyToReceive;

      // Update PO Item received count
      await tx.purchaseOrderItem.update({
        where: { id: poItem.id },
        data: { receivedQuantity: newReceivedQty },
      });

      // Create Goods Receipt item record
      await tx.goodsReceiptItem.create({
        data: {
          receiptId: goodsReceipt.id,
          poItemId: poItem.id,
          productId: poItem.productId || poItem.catalogItem?.productId || null,
          quantityReceived: qtyToReceive,
        },
      });

      // 3. Update or create central inventory
      let targetProductId = poItem.productId || poItem.catalogItem?.productId;

      // If item doesn't have an existing product linked, find or create one in the catalog
      if (!targetProductId) {
        let matchingProd = await tx.product.findFirst({
          where: {
            OR: [
              { partNumber: poItem.partNumber },
              { name: { contains: poItem.partName, mode: 'insensitive' } },
            ],
          },
        });

        if (!matchingProd) {
          const category = await tx.category.findFirst();
          matchingProd = await tx.product.create({
            data: {
              name: poItem.partName,
              slug: (poItem.partName + '-' + poItem.partNumber).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              sku: 'PNX-' + poItem.partNumber,
              partNumber: poItem.partNumber,
              categoryId: category?.id || 'default-cat',
              brand: poItem.brandName,
              basePrice: Number(poItem.unitPrice) * 1.25, // Recommended retail with 25% margin
              mrp: Number(poItem.unitPrice) * 1.4,
              status: 'ACTIVE',
            },
          });
        }
        targetProductId = matchingProd.id;

        // Link catalog item to product for future sync
        if (poItem.catalogItemId) {
          await tx.supplierCatalogItem.update({
            where: { id: poItem.catalogItemId },
            data: { productId: targetProductId },
          });
        }
      }

      // 4. Update Inventory row in PostgreSQL
      let inventory = await tx.inventory.findFirst({
        where: {
          productId: targetProductId,
          shopId: defaultShop.id,
        },
      });

      const previousQty = inventory ? Number(inventory.quantity) : 0;
      const newQty = previousQty + qtyToReceive;

      if (inventory) {
        inventory = await tx.inventory.update({
          where: { id: inventory.id },
          data: {
            quantity: newQty,
            isAvailable: true,
            availabilityStatus: StockAvailability.IN_STOCK,
            updatedAt: new Date(),
          },
        });
      } else {
        const product = await tx.product.findUnique({ where: { id: targetProductId } });
        inventory = await tx.inventory.create({
          data: {
            productId: targetProductId,
            shopId: defaultShop.id,
            quantity: newQty,
            sellingPrice: product?.basePrice || poItem.unitPrice,
            isAvailable: true,
            availabilityStatus: StockAvailability.IN_STOCK,
            lowStockThreshold: 10,
          },
        });
      }

      // 5. Create auditable StockMovement record (Section 18)
      await tx.stockMovement.create({
        data: {
          inventoryId: inventory.id,
          type: StockMovementType.PROCUREMENT_RECEIVED,
          quantity: qtyToReceive, // Positive delta
          previousQty,
          newQty,
          reason: `Bulk procurement stock received from ${po.supplier.name} for ${po.poNumber}`,
          referenceType: 'PURCHASE_ORDER',
          referenceId: po.poNumber,
        },
      });

      receivedItemsSummary.push({
        poItemId: poItem.id,
        partName: poItem.partName,
        partNumber: poItem.partNumber,
        qtyReceived: qtyToReceive,
        previousInventory: previousQty,
        newInventory: newQty,
        inventoryId: inventory.id,
        productId: targetProductId,
      });
    }

    // 6. Check overall PO received state
    const allUpdatedItems = await tx.purchaseOrderItem.findMany({
      where: { purchaseOrderId: po.id },
    });

    const isFullyReceived = allUpdatedItems.every((item) => item.receivedQuantity >= item.orderedQuantity);
    const anyReceived = allUpdatedItems.some((item) => item.receivedQuantity > 0);

    const newPOStatus = isFullyReceived
      ? po.paymentStatus === 'PAID'
        ? 'COMPLETED'
        : 'RECEIVED'
      : anyReceived
      ? 'PARTIALLY_RECEIVED'
      : po.status;

    const updatedPo = await tx.purchaseOrder.update({
      where: { id: po.id },
      data: {
        status: newPOStatus,
        ...(isFullyReceived ? { receivedAt: new Date() } : {}),
      },
      include: { items: true, supplier: true },
    });

    return {
      goodsReceipt,
      purchaseOrder: updatedPo,
      itemsReceived: receivedItemsSummary,
      isFullyReceived,
    };
  });

  // 7. Audit Log & EDI Event Logging (Section 35, 36)
  await prisma.auditLog.create({
    data: {
      userId: adminId,
      action: 'PROCUREMENT_STOCK_RECEIVED',
      entityType: 'GoodsReceipt',
      entityId: result.goodsReceipt.id,
      changes: {
        poNumber: po.poNumber,
        receiptNumber: result.goodsReceipt.receiptNumber,
        itemsReceived: result.itemsReceived,
      },
    },
  });

  // EDI-style internal inventory synchronization
  for (const it of result.itemsReceived) {
    await InventorySyncEngine.logEvent({
      eventType: 'SUPPLIER_EDI_846_SYNC',
      productId: it.productId,
      productName: it.partName,
      shopId: defaultShop.id,
      previousQty: it.previousInventory,
      newQty: it.newInventory,
      delta: it.qtyReceived,
      reason: `EDI-style internal inventory synchronization: Inbound procurement receipt ${result.goodsReceipt.receiptNumber} (${po.poNumber})`,
      referenceId: po.poNumber,
      actor: adminId ? `ADMIN:${adminId}` : 'PLATFORM_PROCUREMENT_HUB',
      metadata: {
        supplier: po.supplier.name,
        partNumber: it.partNumber,
        receiptNumber: result.goodsReceipt.receiptNumber,
      },
    });
  }

  return result;
}

/**
 * Procurement History & Audit Trail
 * Section 22
 */
export async function getProcurementHistory(filters?: {
  supplierId?: string;
  status?: string;
  search?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}) {
  const where: any = {};

  if (filters?.supplierId && filters.supplierId !== 'ALL') {
    where.supplierId = filters.supplierId;
  }

  if (filters?.status && filters.status !== 'ALL') {
    where.status = filters.status;
  }

  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
    if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
  }

  if (filters?.search) {
    const q = filters.search.trim();
    where.OR = [
      { poNumber: { contains: q, mode: 'insensitive' } },
      { supplier: { name: { contains: q, mode: 'insensitive' } } },
      { items: { some: { partNumber: { contains: q, mode: 'insensitive' } } } },
    ];
  }

  const [orders, receipts, auditEntries] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        supplier: true,
        items: true,
        goodsReceipts: { include: { items: true } },
        payments: true,
      },
    }),
    prisma.goodsReceipt.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        purchaseOrder: { include: { supplier: true } },
        items: true,
      },
    }),
    prisma.auditLog.findMany({
      where: {
        action: {
          in: [
            'PURCHASE_ORDER_CREATED',
            'PO_STATUS_CHANGED',
            'PROCUREMENT_STOCK_RECEIVED',
            'PROCUREMENT_PAYMENT_MARKED',
            'SUPPLIER_CREATED',
          ],
        },
      },
      take: 25,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, firstName: true, lastName: true, role: true } } },
    }),
  ]);

  return {
    orders,
    receipts,
    auditEntries,
  };
}

/**
 * Master Data Helpers for Frontend Dropdowns
 */
export async function getProcurementVehicles() {
  const makes = await prisma.vehicleMake.findMany({
    orderBy: { name: 'asc' },
    include: {
      models: {
        orderBy: { name: 'asc' },
        include: {
          variants: { orderBy: { name: 'asc' } },
        },
      },
    },
  });
  return makes;
}

export async function getProcurementCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true, description: true },
  });
  return categories;
}
