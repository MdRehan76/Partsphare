import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';
import { generateOrderNumber } from '../../utils/helpers';
import { OrderStatus, PaymentMethod, PaymentStatus, DIFMType, DIFMStatus } from '@prisma/client';
import {
  calculateAuthoritativePricing,
  findEligiblePartneredShops,
  evaluateCartDIFM,
  resolveItemUnitPrice,
  LocationPoint,
} from './difmEngine';
import { InventorySyncEngine } from '../inventory/inventorySync.service';

export const listCustomerOrders = async (userId: string) => {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: { name: true, slug: true, brand: true, partNumber: true, images: true },
          },
          shop: { select: { name: true, city: true } },
        },
      },
      payment: true,
      difmRequest: {
        include: { shop: { select: { name: true, phone: true } } },
      },
      tracking: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getOrderById = async (userId: string, orderId: string) => {
  const order = await prisma.order.findFirst({
    where: {
      userId,
      OR: [
        { id: orderId },
        { orderNumber: orderId },
      ],
    },
    include: {
      items: {
        include: {
          product: {
            include: { images: true, brandRel: true },
          },
          shop: true,
        },
      },
      address: true,
      payment: true,
      difmRequest: {
        include: { shop: true, serviceBooking: true },
      },
      deliveryAssignments: {
        include: {
          deliveryPartner: {
            include: { user: true },
          },
        },
      },
      tracking: {
        orderBy: { createdAt: 'asc' },
      },
      statusHistory: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!order) throw AppError.notFound('Order not found.');
  return {
    ...order,
    pricing: {
      partSubtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      installationFee: Number(order.installationFee),
      homeVisitSurcharge: Number(order.homeVisitSurcharge),
      discount: Number(order.discount),
      grandTotal: Number(order.total),
    },
  };
};

/**
 * Recalculates authoritative checkout pricing immediately when option, address, or coupon changes.
 * Used by GET/POST /api/orders/checkout-quote.
 */
export const getCheckoutQuote = async (
  userId: string,
  data: {
    addressId?: string;
    difmType?: string | null;
    shopId?: string | null;
    couponCode?: string;
  }
) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!cart || !cart.items || cart.items.length === 0) {
    throw AppError.badRequest('Your shopping cart is empty.');
  }

  // 1. Resolve customer address
  let address: any = null;
  if (data.addressId) {
    address = await prisma.address.findFirst({
      where: { id: data.addressId, userId },
    });
  }
  if (!address) {
    // Default address fallback
    address = await prisma.address.findFirst({
      where: { userId, isDefault: true },
    });
  }
  if (!address) {
    // Any address fallback
    address = await prisma.address.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 2. Discover eligible partnered shops
  const eligibleShops = await findEligiblePartneredShops(address);

  // 3. Resolve shop for installation
  let assignedShop: any = null;
  if (data.shopId) {
    assignedShop = eligibleShops.find((s: any) => s.id === data.shopId) || null;
  }
  if (!assignedShop && eligibleShops.length > 0) {
    assignedShop = eligibleShops[0]; // Nearest shop
  }

  // 4. Calculate Authoritative Pricing via DIFM Engine
  const pricing = await calculateAuthoritativePricing({
    cartItems: cart.items,
    difmType: data.difmType,
    customerAddress: address,
    shopLocation: assignedShop,
    couponCode: data.couponCode,
  });

  return {
    cartSummary: {
      itemCount: cart.items.reduce((sum: number, it: any) => sum + it.quantity, 0),
      items: cart.items.map((it: any) => {
        const unitPrice = resolveItemUnitPrice(it);
        const qty = it.quantity;
        return {
          id: it.id,
          productId: it.productId,
          productName: it.product?.name,
          partNumber: it.product?.partNumber,
          unitPrice,
          quantity: qty,
          totalPrice: unitPrice * qty,
          requiresDIFM: Boolean(it.product?.requiresDIFM),
          difficulty: it.product?.installationDifficulty || 'EASY',
        };
      }),
      hasDifficultParts: pricing.difmEvaluation.requiresDIFM,
      difficultItems: pricing.difmEvaluation.difficultItems,
    },
    pricing: {
      partSubtotal: pricing.partSubtotal,
      deliveryFee: pricing.deliveryFee,
      installationFee: pricing.installationFee,
      homeVisitSurcharge: pricing.homeVisitSurcharge,
      discount: pricing.discount,
      grandTotal: pricing.grandTotal,
      // Compatibility metadata
      baseInstallationFee: pricing.installationFee,
      appliedCoupon: pricing.appliedCoupon,
    },
    difm: {
      required: pricing.difmEvaluation.requiresDIFM,
      selectedType: pricing.resolvedDIFMType,
      assignedShop: assignedShop
        ? {
            id: assignedShop.id,
            name: assignedShop.name,
            address: assignedShop.address,
            city: assignedShop.city,
            pincode: assignedShop.pincode,
            phone: assignedShop.phone,
            rating: assignedShop.rating,
          }
        : null,
      distanceKm: pricing.distanceKm,
      durationMinutes: pricing.durationMinutes,
    },
    eligibleShops,
    selectedAddress: address
      ? {
          id: address.id,
          label: address.label,
          fullName: address.fullName,
          phone: address.phone,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          isDefault: address.isDefault,
        }
      : null,
  };
};

/**
 * Places order with strict backend-authoritative calculation.
 * Client cannot manipulate prices.
 * Products marked difficult-to-install MUST have an explicit DIFM option selected.
 */
export const createOrderDraft = async (
  userId: string,
  data: {
    addressId: string;
    difmType?: DIFMType | string;
    shopId?: string;
    paymentMethod: PaymentMethod;
    couponCode?: string;
    preferredDate?: string;
    notes?: string;
    // Any client-side total / subtotal / fee provided in data is completely ignored!
  }
) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!cart || !cart.items || cart.items.length === 0) {
    throw AppError.badRequest('Your shopping cart is empty.');
  }

  // Validate address
  if (!data.addressId) {
    throw AppError.badRequest('Please provide a delivery address ID.');
  }

  const address = await prisma.address.findFirst({
    where: { id: data.addressId, userId },
  });

  if (!address) {
    throw AppError.badRequest('Selected delivery address was not found.');
  }

  // Evaluate cart DIFM
  const difmEval = evaluateCartDIFM(cart.items);

  // ACCEPTANCE TEST REQUIREMENT:
  // "Difficult-install product cannot bypass required DIFM selection"
  if (difmEval.requiresDIFM) {
    if (
      !data.difmType ||
      (data.difmType !== 'HOME_INSTALLATION' &&
        data.difmType !== 'SHOP_INSTALLATION' &&
        data.difmType !== 'NO_INSTALLATION' &&
        data.difmType !== DIFMType.HOME_INSTALLATION &&
        data.difmType !== DIFMType.SHOP_INSTALLATION &&
        data.difmType !== DIFMType.NO_INSTALLATION)
    ) {
      throw AppError.badRequest(
        'One or more products in your cart require installation selection. Please choose Home Installation (Option A), Partnered Shop (Option B), or No Installation (Option C).'
      );
    }
  }

  // Resolve assigned partnered shop
  const eligibleShops = await findEligiblePartneredShops(address);
  let assignedShop: any = null;
  if (data.shopId) {
    assignedShop = eligibleShops.find((s: any) => s.id === data.shopId) || null;
  }
  if (!assignedShop && eligibleShops.length > 0) {
    assignedShop = eligibleShops[0];
  }

  // 1. Authoritative Inventory Stock Check: Prevent negative stock or ordering above available inventory
  for (const it of cart.items) {
    const inv = await prisma.inventory.findFirst({
      where: {
        productId: it.productId,
        ...(it.shopId ? { shopId: it.shopId } : {}),
      },
    });

    const stock = inv ? Number(inv.quantity || 0) : 0;
    if (!inv || stock < it.quantity) {
      throw AppError.badRequest(
        `Insufficient inventory for "${it.product?.name || 'Selected product'}". Requested: ${it.quantity}, Available in stock: ${stock}. Please adjust quantity.`
      );
    }
  }

  // Calculate authoritative pricing strictly on backend
  const pricing = await calculateAuthoritativePricing({
    cartItems: cart.items,
    difmType: data.difmType,
    customerAddress: address,
    shopLocation: assignedShop,
    couponCode: data.couponCode,
  });

  const orderNumber = generateOrderNumber();

  const newOrder = await prisma.$transaction(async (tx: any) => {
    // Deduct stock atomically in database with concurrency safety
    for (const it of cart.items) {
      const inv = await tx.inventory.findFirst({
        where: {
          productId: it.productId,
          ...(it.shopId ? { shopId: it.shopId } : {}),
        },
      });
      const currentStock = inv ? Number(inv.quantity || 0) : 0;
      if (!inv || currentStock < it.quantity) {
        throw AppError.badRequest(
          `Insufficient inventory for "${it.product?.name || 'Selected product'}". Requested: ${it.quantity}, Available in stock: ${currentStock}. Please adjust quantity.`
        );
      }
      const newQty = currentStock - it.quantity;
      await tx.inventory.update({
        where: { id: inv.id },
        data: {
          quantity: newQty,
          isAvailable: newQty > 0,
          availabilityStatus: newQty > 0 ? (newQty <= 5 ? 'LOW_STOCK' : 'IN_STOCK') : 'OUT_OF_STOCK',
          updatedAt: new Date(),
        },
      });
    }

    const isOnlinePayment = data.paymentMethod === PaymentMethod.RAZORPAY;
    const initialOrderStatus = isOnlinePayment ? OrderStatus.PENDING : OrderStatus.CONFIRMED;
    const initialPaymentStatus = PaymentStatus.PENDING;
    const razorpayOrderId = isOnlinePayment
      ? `order_rzp_sandbox_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
      : null;
    const trackingMsg = isOnlinePayment
      ? 'Order created. Awaiting Razorpay Sandbox payment verification.'
      : 'Order placed successfully with Cash on Delivery (Payment pending on delivery/fitment).';

    const createdOrder = await tx.order.create({
      data: {
        orderNumber,
        userId,
        addressId: data.addressId,
        status: initialOrderStatus,
        paymentMethod: data.paymentMethod || PaymentMethod.CASH_ON_DELIVERY,
        paymentStatus: initialPaymentStatus,
        subtotal: pricing.partSubtotal,
        deliveryFee: pricing.deliveryFee,
        discount: pricing.discount,
        installationFee: pricing.installationFee,
        homeVisitSurcharge: pricing.homeVisitSurcharge,
        total: pricing.grandTotal,
        couponCode: data.couponCode || null,
        notes: data.notes || null,
        difmType: pricing.resolvedDIFMType,
        items: {
          create: cart.items.map((it: any) => {
            const unitPrice = resolveItemUnitPrice(it);
            return {
              productId: it.productId,
              shopId: it.shopId,
              quantity: it.quantity,
              unitPrice: unitPrice,
              totalPrice: unitPrice * it.quantity,
            };
          }),
        },
        payment: {
          create: {
            method: data.paymentMethod || PaymentMethod.CASH_ON_DELIVERY,
            amount: pricing.grandTotal,
            status: initialPaymentStatus,
            razorpayOrderId,
          },
        },
        tracking: {
          create: {
            status: initialOrderStatus,
            message: trackingMsg,
          },
        },
        ...(pricing.resolvedDIFMType !== DIFMType.NO_INSTALLATION
          ? {
              difmRequest: {
                create: {
                  shopId: assignedShop?.id || null,
                  type: pricing.resolvedDIFMType,
                  status: DIFMStatus.PENDING,
                  installationFee: pricing.installationFee,
                  homeVisitSurcharge: pricing.homeVisitSurcharge,
                  preferredDate: data.preferredDate
                    ? new Date(data.preferredDate)
                    : new Date(Date.now() + 86400000 * 2), // 2 days from now
                  notes: data.notes || null,
                },
              },
            }
          : {}),
      },
    });

    // Clear cart items immediately for Cash on Delivery (since COD orders are immediately CONFIRMED).
    // For online Razorpay payments, cart items are cleared authoritatively upon backend verification
    // so the customer doesn't lose their cart if the payment window is cancelled or declined.
    if (!isOnlinePayment) {
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return createdOrder;
  });

  // Log authoritative inventory stock deduction events
  for (const it of cart.items) {
    const inv = await prisma.inventory.findFirst({
      where: {
        productId: it.productId,
        ...(it.shopId ? { shopId: it.shopId } : {}),
      },
    });
    const currentStock = inv ? Number(inv.quantity) : 0;
    await InventorySyncEngine.recordOrderDeduction(
      it.productId,
      it.shopId || inv?.shopId || 'shop-1',
      it.quantity,
      currentStock + it.quantity,
      currentStock,
      newOrder.id,
      userId
    );
  }

  return getOrderById(userId, newOrder.id);
};

export const getOrderTracking = async (orderId: string) => {
  return prisma.orderTracking.findMany({
    where: { orderId },
    orderBy: { createdAt: 'asc' },
  });
};

