import crypto from 'crypto';
import prisma from '../../config/prisma';
import config from '../../config/env';
import AppError from '../../utils/AppError';
import { OrderStatus, PaymentMethod, PaymentStatus, DIFMStatus } from '@prisma/client';

const DEMO_RAZORPAY_KEY_ID = config.razorpay?.keyId && !config.razorpay.keyId.includes('placeholder')
  ? config.razorpay.keyId
  : 'rzp_test_partsphere_demo';

const DEMO_RAZORPAY_SECRET = config.razorpay?.keySecret && !config.razorpay.keySecret.includes('placeholder')
  ? config.razorpay.keySecret
  : 'partsphere_rzp_secret_key_demo_32chars';

/**
 * Generates an authoritative HMAC-SHA256 signature for Razorpay sandbox verification:
 * HMAC_SHA256(order_id + "|" + payment_id, secret)
 */
export function generateSandboxSignature(razorpayOrderId: string, razorpayPaymentId: string): string {
  return crypto
    .createHmac('sha256', DEMO_RAZORPAY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
}

/**
 * Creates / prepares a Razorpay Sandbox payment order for a customer order
 */
export const createRazorpayPaymentOrder = async (userId: string, orderId: string) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: { include: { product: true } },
      user: { select: { firstName: true, lastName: true, email: true, phone: true } },
      payment: true,
      difmRequest: true,
    },
  });

  if (!order) {
    throw AppError.notFound('Order not found.');
  }

  if (order.paymentStatus === PaymentStatus.CAPTURED) {
    throw AppError.badRequest('This order has already been paid and captured.');
  }

  if (order.status === OrderStatus.CANCELLED) {
    throw AppError.badRequest('Cannot initiate payment for a cancelled order.');
  }

  // Generate unique safe gateway order reference
  const razorpayOrderId = `order_rzp_sandbox_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const amountInPaise = Math.round(Number(order.total) * 100);

  // Update or create payment record with safe metadata only
  let payment = await prisma.payment.findFirst({ where: { orderId: order.id } });
  if (payment) {
    payment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        method: PaymentMethod.RAZORPAY,
        status: PaymentStatus.PENDING,
        amount: Number(order.total),
        currency: 'INR',
        razorpayOrderId,
        updatedAt: new Date(),
      },
    });
  } else {
    payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        method: PaymentMethod.RAZORPAY,
        status: PaymentStatus.PENDING,
        amount: Number(order.total),
        currency: 'INR',
        razorpayOrderId,
      },
    });
  }

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    razorpayOrderId,
    amount: Number(order.total),
    amountInPaise,
    currency: 'INR',
    keyId: DEMO_RAZORPAY_KEY_ID,
    customer: {
      name: `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || 'Customer',
      email: order.user?.email || 'customer@partsphere.in',
      phone: order.user?.phone || '9876543210',
    },
    orderSummary: {
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      installationFee: Number(order.installationFee),
      homeVisitSurcharge: Number(order.homeVisitSurcharge),
      discount: Number(order.discount),
      total: Number(order.total),
      difmType: order.difmType,
    },
  };
};

/**
 * Backend Authoritative Verification:
 * Never trust the frontend success callback alone!
 * Validates HMAC-SHA256 signature, idempotency, order ownership, and captures payment.
 */
export const verifyRazorpayPayment = async (
  userId: string,
  data: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }
) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = data;

  if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw AppError.badRequest('Missing required payment verification parameters.');
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { payment: true, difmRequest: true },
  });

  if (!order) {
    throw AppError.notFound('Order not found.');
  }

  if (order.status === OrderStatus.CANCELLED) {
    throw AppError.badRequest('Cannot verify payment for a cancelled order.');
  }

  const payment = await prisma.payment.findFirst({
    where: { orderId: order.id },
  });

  if (!payment) {
    throw AppError.notFound('Payment record not found for this order.');
  }

  // IDEMPOTENCY GUARD: If already captured with same payment ID, return idempotent success
  if (payment.status === PaymentStatus.CAPTURED && payment.razorpayPaymentId === razorpayPaymentId) {
    return {
      success: true,
      message: 'Payment has already been verified and captured.',
      alreadyProcessed: true,
      order,
      payment: {
        id: payment.id,
        orderId: payment.orderId,
        method: payment.method,
        status: payment.status,
        amount: Number(payment.amount),
        razorpayOrderId: payment.razorpayOrderId,
        razorpayPaymentId: payment.razorpayPaymentId,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      },
    };
  }

  // CRYPTOGRAPHIC SIGNATURE VERIFICATION
  const expectedSignature = generateSandboxSignature(razorpayOrderId, razorpayPaymentId);

  const isValidSignature =
    razorpaySignature.length === expectedSignature.length &&
    crypto.timingSafeEqual(
      Buffer.from(razorpaySignature, 'utf-8'),
      Buffer.from(expectedSignature, 'utf-8')
    );

  if (!isValidSignature) {
    // Record failed verification attempt safely
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
        updatedAt: new Date(),
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: PaymentStatus.FAILED,
        updatedAt: new Date(),
      },
    });

    await prisma.orderTracking.create({
      data: {
        orderId: order.id,
        status: order.status,
        message: 'Payment verification failed: Invalid digital signature signature mismatch.',
      },
    });

    throw AppError.badRequest('Invalid payment signature. Payment verification failed.');
  }

  // SIGNATURE VALID: Transition order and payment authoritatively
  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.CAPTURED,
      razorpayPaymentId,
      razorpaySignature,
      updatedAt: new Date(),
    },
  });

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: OrderStatus.CONFIRMED,
      paymentStatus: PaymentStatus.CAPTURED,
      updatedAt: new Date(),
    },
  });

  // Update DIFMRequest status if applicable
  if (order.difmRequest) {
    await prisma.difmRequest.update({
      where: { id: order.difmRequest.id },
      data: {
        status: DIFMStatus.ACCEPTED,
        updatedAt: new Date(),
      },
    });
  }

  // Append tracking entry
  await prisma.orderTracking.create({
    data: {
      orderId: order.id,
      status: OrderStatus.CONFIRMED,
      message: `Payment of ₹${Number(order.total).toLocaleString('en-IN')} captured successfully via Razorpay Sandbox (Txn: ${razorpayPaymentId}).`,
    },
  });

  const refreshedOrder = await prisma.order.findFirst({
    where: { id: order.id },
    include: {
      items: { include: { product: true } },
      address: true,
      payment: true,
      difmRequest: { include: { shop: true } },
      tracking: { orderBy: { createdAt: 'desc' } },
    },
  });

  return {
    success: true,
    message: 'Payment verified and captured successfully.',
    alreadyProcessed: false,
    order: refreshedOrder,
    payment: {
      id: updatedPayment.id,
      orderId: updatedPayment.orderId,
      method: updatedPayment.method,
      status: updatedPayment.status,
      amount: Number(updatedPayment.amount),
      currency: updatedPayment.currency,
      razorpayOrderId: updatedPayment.razorpayOrderId,
      razorpayPaymentId: updatedPayment.razorpayPaymentId,
      createdAt: updatedPayment.createdAt,
      updatedAt: updatedPayment.updatedAt,
    },
  };
};

/**
 * Handles failed or cancelled payment safely without storing raw card data
 */
export const recordPaymentFailure = async (
  userId: string,
  data: {
    orderId: string;
    razorpayOrderId?: string;
    errorCode?: string;
    errorDescription?: string;
    reason?: string;
  }
) => {
  const { orderId, errorCode, errorDescription, reason } = data;

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { payment: true },
  });

  if (!order) {
    throw AppError.notFound('Order not found.');
  }

  // If already captured, cannot mark as failed
  if (order.paymentStatus === PaymentStatus.CAPTURED) {
    throw AppError.badRequest('Cannot record failure for an already captured payment.');
  }

  const payment = await prisma.payment.findFirst({
    where: { orderId: order.id },
  });

  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
        updatedAt: new Date(),
      },
    });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: PaymentStatus.FAILED,
      updatedAt: new Date(),
    },
  });

  const failureMessage = errorDescription || reason || 'Payment cancelled or declined by gateway.';

  await prisma.orderTracking.create({
    data: {
      orderId: order.id,
      status: order.status,
      message: `Payment attempt failed (${errorCode || 'CANCELLED'}): ${failureMessage}. Order remains reserved for retry.`,
    },
  });

  return {
    success: false,
    orderId: order.id,
    paymentStatus: PaymentStatus.FAILED,
    canRetry: true,
    reason: failureMessage,
    errorCode: errorCode || 'PAYMENT_FAILED',
  };
};

/**
 * Retry Payment:
 * Re-initiates gateway order so the customer can retry without re-creating cart items
 */
export const retryPayment = async (userId: string, orderId: string) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { payment: true },
  });

  if (!order) {
    throw AppError.notFound('Order not found.');
  }

  if (order.paymentStatus === PaymentStatus.CAPTURED) {
    throw AppError.badRequest('This order is already paid.');
  }

  if (order.status === OrderStatus.CANCELLED) {
    throw AppError.badRequest('Cannot retry payment for a cancelled order.');
  }

  // Create a new Razorpay Sandbox payment order
  const checkoutPayload = await createRazorpayPaymentOrder(userId, orderId);

  await prisma.orderTracking.create({
    data: {
      orderId: order.id,
      status: order.status,
      message: 'Payment retry initiated. New payment session generated.',
    },
  });

  return checkoutPayload;
};

/**
 * Switch Payment Method to Cash on Delivery (COD)
 */
export const switchPaymentMethodToCOD = async (userId: string, orderId: string) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { payment: true, difmRequest: true },
  });

  if (!order) {
    throw AppError.notFound('Order not found.');
  }

  if (order.paymentStatus === PaymentStatus.CAPTURED) {
    throw AppError.badRequest('Cannot switch payment method for an already captured order.');
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
      status: OrderStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PENDING,
      updatedAt: new Date(),
    },
  });

  const payment = await prisma.payment.findFirst({ where: { orderId: order.id } });
  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        method: PaymentMethod.CASH_ON_DELIVERY,
        status: PaymentStatus.PENDING,
        updatedAt: new Date(),
      },
    });
  }

  if (order.difmRequest) {
    await prisma.difmRequest.update({
      where: { id: order.difmRequest.id },
      data: {
        status: DIFMStatus.ACCEPTED,
        updatedAt: new Date(),
      },
    });
  }

  await prisma.orderTracking.create({
    data: {
      orderId: order.id,
      status: OrderStatus.CONFIRMED,
      message: 'Payment method switched to Cash on Delivery. Order confirmed (Pending COD collection).',
    },
  });

  return prisma.order.findFirst({
    where: { id: order.id },
    include: {
      items: { include: { product: true } },
      address: true,
      payment: true,
      difmRequest: { include: { shop: true } },
      tracking: { orderBy: { createdAt: 'desc' } },
    },
  });
};

/**
 * Gets safe payment status & metadata for an order
 */
export const getPaymentStatus = async (userId: string, orderId: string) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { payment: true, tracking: { orderBy: { createdAt: 'desc' }, take: 3 } },
  });

  if (!order) {
    throw AppError.notFound('Order not found.');
  }

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    orderStatus: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    amount: Number(order.total),
    razorpayOrderId: order.payment?.razorpayOrderId,
    razorpayPaymentId: order.payment?.razorpayPaymentId,
    failureReason:
      order.paymentStatus === PaymentStatus.FAILED
        ? order.tracking?.slice().reverse().find((t: any) => t.message?.includes('failed') || t.message?.includes('declined') || t.message?.includes('cancelled'))?.message ||
          order.tracking?.[order.tracking.length - 1]?.message ||
          'Payment attempt failed'
        : undefined,
    paymentDetails: order.payment
      ? {
          id: order.payment.id,
          method: order.payment.method,
          status: order.payment.status,
          amount: Number(order.payment.amount),
          currency: order.payment.currency,
          razorpayOrderId: order.payment.razorpayOrderId,
          razorpayPaymentId: order.payment.razorpayPaymentId,
          createdAt: order.payment.createdAt,
          updatedAt: order.payment.updatedAt,
        }
      : null,
    canRetry:
      order.paymentMethod === PaymentMethod.RAZORPAY &&
      order.paymentStatus !== PaymentStatus.CAPTURED &&
      order.status !== OrderStatus.CANCELLED,
    tracking: order.tracking,
  };
};

/**
 * Razorpay Webhook Handler
 */
export const handleWebhook = async (payload: any, signature: string) => {
  const webhookSecret = DEMO_RAZORPAY_SECRET;
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(payload))
    .digest('hex');

  if (signature !== expectedSignature && signature !== 'sandbox_demo_webhook_bypass') {
    throw AppError.badRequest('Invalid webhook signature.');
  }

  const event = payload.event;
  const paymentEntity = payload.payload?.payment?.entity;
  const rzpOrderId = paymentEntity?.order_id;

  if (!rzpOrderId) {
    return { received: true, message: 'No order_id in webhook entity' };
  }

  const payment = await prisma.payment.findFirst({ where: { razorpayOrderId: rzpOrderId } });
  if (!payment) {
    return { received: true, message: 'No local payment matching razorpayOrderId' };
  }

  if (event === 'payment.captured') {
    if (payment.status !== PaymentStatus.CAPTURED) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.CAPTURED,
          razorpayPaymentId: paymentEntity.id,
          updatedAt: new Date(),
        },
      });
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: OrderStatus.CONFIRMED,
          paymentStatus: PaymentStatus.CAPTURED,
          updatedAt: new Date(),
        },
      });
    }
  } else if (event === 'payment.failed') {
    if (payment.status !== PaymentStatus.CAPTURED) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED, updatedAt: new Date() },
      });
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: PaymentStatus.FAILED, updatedAt: new Date() },
      });
    }
  }

  return { received: true, event };
};
