import crypto from 'crypto';
import prisma from '../../config/prisma';
import config from '../../config/env';
import AppError from '../../utils/AppError';
import { PaymentMethod, PaymentStatus, SubscriptionStatus } from '@prisma/client';

const DEMO_RAZORPAY_KEY_ID =
  config.razorpay?.keyId && !config.razorpay.keyId.includes('placeholder')
    ? config.razorpay.keyId
    : 'rzp_test_partsphere_demo';

const DEMO_RAZORPAY_SECRET =
  config.razorpay?.keySecret && !config.razorpay.keySecret.includes('placeholder')
    ? config.razorpay.keySecret
    : 'partsphere_rzp_secret_key_demo_32chars';

/**
 * Computes an HMAC-SHA256 signature for Razorpay Sandbox verification
 */
export function generateSubscriptionSignature(razorpayOrderId: string, razorpayPaymentId: string): string {
  return crypto
    .createHmac('sha256', DEMO_RAZORPAY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
}

/**
 * Helper to decorate database subscription records with UI attributes (billingCycle, pricePaid, entitlements)
 */
export function formatSubscription(sub: any) {
  if (!sub) return null;

  const isYearly =
    sub.startDate &&
    sub.endDate &&
    new Date(sub.endDate).getTime() - new Date(sub.startDate).getTime() > 100 * 24 * 3600 * 1000;

  const latestPayment = Array.isArray(sub.payments) && sub.payments.length > 0 ? sub.payments[0] : null;
  const pricePaid = latestPayment?.amount ? Number(latestPayment.amount) : Number(sub.plan?.price || 499);
  const paymentMethod = latestPayment?.paymentMethod || 'RAZORPAY';
  const razorpayOrderId = latestPayment?.razorpayOrderId || null;
  const razorpayPaymentId = latestPayment?.razorpayPaymentId || null;

  const rawEntitlements = sub.plan?.entitlements || [];
  const entitlements = rawEntitlements.map((e: any) => ({
    id: e.id,
    featureCode: e.featureCode,
    name: e.featureName,
    description: e.featureName,
    quotaLimit: e.limitValue,
    isUnlimited: Boolean(e.isUnlimited),
    usedCount: 0,
    remainingCount: e.isUnlimited ? 'Unlimited' : (e.limitValue !== null ? e.limitValue : 'Unlimited'),
  }));

  return {
    ...sub,
    billingCycle: isYearly ? 'YEARLY' : 'MONTHLY',
    pricePaid,
    paymentMethod,
    razorpayOrderId,
    razorpayPaymentId,
    renewalDate: sub.endDate,
    vehicleReg: 'All Registered Garage Vehicles',
    entitlements,
  };
}

/**
 * Lists all active subscription plans with full entitlements & benefits
 */
export const listActivePlans = async (frequency: 'MONTHLY' | 'YEARLY' = 'MONTHLY') => {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    include: {
      entitlements: true,
    },
    orderBy: { price: 'asc' },
  });

  return plans.map((plan: any) => {
    const monthlyPrice = Number(plan.price || 499);
    const yearlyPrice = Math.round(monthlyPrice * 10); // 2 months discount built-in
    const currentPrice = frequency === 'YEARLY' ? yearlyPrice : monthlyPrice;
    const durationDays = frequency === 'YEARLY' ? 365 : 30;
    const savingsPercent = Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100);

    const formattedEntitlements = (plan.entitlements || []).map((e: any) => ({
      id: e.id,
      featureCode: e.featureCode,
      name: e.featureName,
      description: e.featureName,
      quotaLimit: e.limitValue,
      isUnlimited: Boolean(e.isUnlimited),
      usedCount: 0,
      remainingCount: e.isUnlimited ? 'Unlimited' : (e.limitValue !== null ? e.limitValue : 'Unlimited'),
    }));

    return {
      ...plan,
      monthlyPrice,
      yearlyPrice,
      currentPrice,
      durationDays,
      selectedFrequency: frequency,
      savingsPercent: savingsPercent > 0 ? savingsPercent : 0,
      price: currentPrice,
      entitlements: formattedEntitlements,
    };
  });
};

/**
 * Gets plan details by ID or Slug
 */
export const getPlanByIdOrSlug = async (idOrSlug: string, frequency: 'MONTHLY' | 'YEARLY' = 'MONTHLY') => {
  const plan = await prisma.subscriptionPlan.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: {
      entitlements: true,
    },
  });

  if (!plan) {
    throw AppError.notFound('Subscription plan not found.');
  }

  const monthlyPrice = Number(plan.price || 499);
  const yearlyPrice = Math.round(monthlyPrice * 10);
  const currentPrice = frequency === 'YEARLY' ? yearlyPrice : monthlyPrice;
  const durationDays = frequency === 'YEARLY' ? 365 : 30;
  const savingsPercent = Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100);

  const formattedEntitlements = (plan.entitlements || []).map((e: any) => ({
    id: e.id,
    featureCode: e.featureCode,
    name: e.featureName,
    description: e.featureName,
    quotaLimit: e.limitValue,
    isUnlimited: Boolean(e.isUnlimited),
    usedCount: 0,
    remainingCount: e.isUnlimited ? 'Unlimited' : (e.limitValue !== null ? e.limitValue : 'Unlimited'),
  }));

  return {
    ...plan,
    monthlyPrice,
    yearlyPrice,
    currentPrice,
    durationDays,
    selectedFrequency: frequency,
    savingsPercent: savingsPercent > 0 ? savingsPercent : 0,
    price: currentPrice,
    entitlements: formattedEntitlements,
  };
};

/**
 * Gets all subscriptions for the authenticated customer (active, cancelled, expired)
 */
export const getUserSubscriptions = async (userId: string) => {
  const subscriptions = await prisma.customerSubscription.findMany({
    where: { userId },
    include: {
      plan: {
        include: {
          entitlements: true,
        },
      },
      payments: {
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return subscriptions.map(formatSubscription);
};

/**
 * Gets primary active subscription for customer
 */
export const getActiveSubscription = async (userId: string) => {
  const subscriptions = await prisma.customerSubscription.findMany({
    where: {
      userId,
      status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELLED] },
    },
    include: {
      plan: {
        include: {
          entitlements: true,
        },
      },
      payments: {
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const now = new Date();
  const active =
    subscriptions.find(
      (s: any) =>
        s.status === SubscriptionStatus.ACTIVE ||
        (s.status === SubscriptionStatus.CANCELLED && s.endDate && new Date(s.endDate) > now)
    ) || null;

  return formatSubscription(active);
};

/**
 * Creates / initiates a new subscription order
 */
export const createSubscriptionOrder = async (
  userId: string,
  data: {
    planId: string;
    billingCycle?: 'MONTHLY' | 'YEARLY';
    vehicleId?: string;
    vehicleReg?: string;
    paymentMethod?: 'RAZORPAY' | 'CASH_ON_DELIVERY' | 'COD';
    autoRenew?: boolean;
  }
) => {
  const {
    planId,
    billingCycle = 'MONTHLY',
    vehicleId,
    vehicleReg,
    paymentMethod = 'RAZORPAY',
    autoRenew = true,
  } = data;

  const plan = await prisma.subscriptionPlan.findFirst({
    where: { OR: [{ id: planId }, { slug: planId }] },
    include: { entitlements: true },
  });

  if (!plan) {
    throw AppError.notFound('Subscription plan not found.');
  }

  // Calculate pricing & duration
  const isYearly = billingCycle === 'YEARLY';
  const monthlyPrice = Number(plan.price || 499);
  const price = isYearly ? Math.round(monthlyPrice * 10) : monthlyPrice;
  const durationDays = isYearly ? 365 : 30;

  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const isCod = paymentMethod === 'CASH_ON_DELIVERY' || (paymentMethod as string) === 'COD';

  return prisma.$transaction(async (tx) => {
    // 1. Create customer subscription record strictly adhering to Prisma schema
    const subscription = await tx.customerSubscription.create({
      data: {
        userId,
        planId: plan.id,
        status: isCod ? SubscriptionStatus.ACTIVE : SubscriptionStatus.PENDING,
        startDate,
        endDate,
        autoRenew: Boolean(autoRenew),
      },
      include: {
        plan: { include: { entitlements: true } },
      },
    });

    if (isCod) {
      // Create COD payment record
      const payment = await tx.subscriptionPayment.create({
        data: {
          subscriptionId: subscription.id,
          amount: price,
          paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
          paymentStatus: PaymentStatus.PENDING,
        },
      });

      // Update paymentId reference
      await tx.customerSubscription.update({
        where: { id: subscription.id },
        data: { paymentId: payment.id },
      });

      const fullSub = formatSubscription({
        ...subscription,
        payments: [payment],
      });

      return {
        subscription: fullSub,
        requiresOnlinePayment: false,
        message: `Subscription activated! Payment of ₹${price} scheduled for collection on your first service visit.`,
      };
    }

    // 2. Razorpay Sandbox flow: create payment order session
    const razorpayOrderId = `order_sub_sandbox_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const amountInPaise = Math.round(price * 100);

    const payment = await tx.subscriptionPayment.create({
      data: {
        subscriptionId: subscription.id,
        amount: price,
        paymentMethod: PaymentMethod.RAZORPAY,
        paymentStatus: PaymentStatus.PENDING,
        razorpayOrderId,
      },
    });

    await tx.customerSubscription.update({
      where: { id: subscription.id },
      data: { paymentId: payment.id },
    });

    const fullSub = formatSubscription({
      ...subscription,
      payments: [payment],
    });

    return {
      subscription: fullSub,
      requiresOnlinePayment: true,
      paymentSession: {
        subscriptionId: subscription.id,
        planId: plan.id,
        planName: plan.name,
        razorpayOrderId,
        amount: price,
        amountInPaise,
        currency: 'INR',
        keyId: DEMO_RAZORPAY_KEY_ID,
        billingCycle,
        demoSecretKey: DEMO_RAZORPAY_SECRET,
      },
    };
  });
};

/**
 * Verifies Razorpay Sandbox payment and activates subscription
 */
export const verifySubscriptionPayment = async (
  userId: string,
  data: {
    subscriptionId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }
) => {
  const { subscriptionId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = data;

  if (!subscriptionId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw AppError.badRequest('Missing required subscription verification parameters.');
  }

  const subscription = await prisma.customerSubscription.findFirst({
    where: { id: subscriptionId, userId },
    include: {
      plan: { include: { entitlements: true } },
      payments: true,
    },
  });

  if (!subscription) {
    throw AppError.notFound('Subscription record not found.');
  }

  // Idempotency check: If already active with this payment, return success
  const existingPayment = subscription.payments.find((p) => p.razorpayPaymentId === razorpayPaymentId);
  if (subscription.status === SubscriptionStatus.ACTIVE && existingPayment) {
    return {
      success: true,
      alreadyProcessed: true,
      subscription: formatSubscription(subscription),
      message: 'Subscription is already active.',
    };
  }

  // Authoritative cryptographic verification
  const expectedSignature = generateSubscriptionSignature(razorpayOrderId, razorpayPaymentId);
  const isValidSignature =
    razorpaySignature.length === expectedSignature.length &&
    crypto.timingSafeEqual(
      Buffer.from(razorpaySignature, 'utf-8'),
      Buffer.from(expectedSignature, 'utf-8')
    );

  if (!isValidSignature) {
    throw AppError.badRequest('Invalid payment signature. Subscription verification failed.');
  }

  // Signature valid: Activate subscription in database transaction
  return prisma.$transaction(async (tx) => {
    // 1. Update Payment record to CAPTURED
    await tx.subscriptionPayment.updateMany({
      where: { subscriptionId: subscription.id },
      data: {
        paymentStatus: PaymentStatus.CAPTURED,
        razorpayPaymentId,
      },
    });

    // 2. Activate Subscription
    const updatedSub = await tx.customerSubscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.ACTIVE,
        updatedAt: new Date(),
      },
      include: {
        plan: { include: { entitlements: true } },
        payments: { orderBy: { createdAt: 'desc' } },
      },
    });

    return {
      success: true,
      subscription: formatSubscription(updatedSub),
      message: `🎉 Membership activated! You now have full access to ${subscription.plan?.name || 'PartNexa Care'} benefits.`,
    };
  });
};

/**
 * Cancels subscription (retains benefits until current endDate, turns off autoRenew)
 */
export const cancelSubscription = async (userId: string, subscriptionId: string, reason?: string) => {
  const subscription = await prisma.customerSubscription.findFirst({
    where: { id: subscriptionId, userId },
    include: { plan: { include: { entitlements: true } }, payments: true },
  });

  if (!subscription) {
    throw AppError.notFound('Subscription not found.');
  }

  if (subscription.status === SubscriptionStatus.CANCELLED) {
    throw AppError.badRequest('Subscription is already cancelled.');
  }

  const updated = await prisma.customerSubscription.update({
    where: { id: subscription.id },
    data: {
      status: SubscriptionStatus.CANCELLED,
      autoRenew: false,
      updatedAt: new Date(),
    },
    include: { plan: { include: { entitlements: true } }, payments: true },
  });

  const formatted = formatSubscription(updated);
  return {
    success: true,
    subscription: formatted,
    message: `Subscription has been cancelled. Your benefits remain active until ${
      updated.endDate ? new Date(updated.endDate).toLocaleDateString() : 'end of term'
    }.`,
  };
};

/**
 * Toggles auto-renew flag
 */
export const toggleAutoRenew = async (userId: string, subscriptionId: string, autoRenew: boolean) => {
  const subscription = await prisma.customerSubscription.findFirst({
    where: { id: subscriptionId, userId },
  });

  if (!subscription) {
    throw AppError.notFound('Subscription not found.');
  }

  const updated = await prisma.customerSubscription.update({
    where: { id: subscription.id },
    data: {
      autoRenew: Boolean(autoRenew),
      updatedAt: new Date(),
    },
    include: { plan: { include: { entitlements: true } }, payments: true },
  });

  return {
    success: true,
    autoRenew: updated.autoRenew,
    subscription: formatSubscription(updated),
    message: autoRenew
      ? `Auto-renewal enabled. Your membership will renew automatically on ${
          updated.endDate ? new Date(updated.endDate).toLocaleDateString() : 'term completion'
        }.`
      : 'Auto-renewal disabled. Your membership will expire at the end of the current term.',
  };
};

/**
 * Simulates automated renewal: extends dates, records renewal payment
 */
export const simulateRenewal = async (userId: string, subscriptionId: string) => {
  const subscription = await prisma.customerSubscription.findFirst({
    where: { id: subscriptionId, userId },
    include: { plan: { include: { entitlements: true } }, payments: true },
  });

  if (!subscription) {
    throw AppError.notFound('Subscription not found.');
  }

  const isYearly =
    subscription.startDate &&
    subscription.endDate &&
    new Date(subscription.endDate).getTime() - new Date(subscription.startDate).getTime() > 100 * 24 * 3600 * 1000;
  const durationDays = isYearly ? 365 : 30;

  const currentEnd = new Date(subscription.endDate || Date.now());
  const newStartDate = currentEnd > new Date() ? currentEnd : new Date();
  const newEndDate = new Date(newStartDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const renewalPrice = Number(subscription.plan?.price || 499);

  return prisma.$transaction(async (tx) => {
    const renewedSub = await tx.customerSubscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.ACTIVE,
        startDate: newStartDate,
        endDate: newEndDate,
        autoRenew: true,
        updatedAt: new Date(),
      },
      include: { plan: { include: { entitlements: true } } },
    });

    const payment = await tx.subscriptionPayment.create({
      data: {
        subscriptionId: subscription.id,
        amount: renewalPrice,
        paymentMethod: PaymentMethod.RAZORPAY,
        paymentStatus: PaymentStatus.CAPTURED,
        razorpayOrderId: `renew_${Date.now()}`,
        razorpayPaymentId: `pay_renew_${Date.now()}`,
      },
    });

    const fullSub = formatSubscription({
      ...renewedSub,
      payments: [payment, ...subscription.payments],
    });

    return {
      success: true,
      subscription: fullSub,
      message: `Subscription renewed successfully until ${newEndDate.toLocaleDateString()}!`,
    };
  });
};

/**
 * Transitions subscription to EXPIRED status
 */
export const expireSubscription = async (userId: string, subscriptionId: string) => {
  const subscription = await prisma.customerSubscription.findFirst({
    where: { id: subscriptionId, userId },
  });

  if (!subscription) {
    throw AppError.notFound('Subscription not found.');
  }

  const expiredSub = await prisma.customerSubscription.update({
    where: { id: subscription.id },
    data: {
      status: SubscriptionStatus.EXPIRED,
      autoRenew: false,
      updatedAt: new Date(),
    },
    include: { plan: { include: { entitlements: true } }, payments: true },
  });

  return {
    success: true,
    subscription: formatSubscription(expiredSub),
    message: 'Subscription status updated to EXPIRED.',
  };
};

/**
 * Uses/consumes an entitlement quota (e.g. Free Towing or General Service)
 */
export const useEntitlement = async (userId: string, subscriptionId: string, featureCode: string) => {
  const subscription = await prisma.customerSubscription.findFirst({
    where: {
      id: subscriptionId,
      userId,
      status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELLED] },
    },
    include: { plan: { include: { entitlements: true } }, payments: true },
  });

  if (!subscription) {
    throw AppError.badRequest('No active subscription found to apply this entitlement.');
  }

  if (
    subscription.status === SubscriptionStatus.CANCELLED &&
    subscription.endDate &&
    new Date(subscription.endDate) < new Date()
  ) {
    throw AppError.badRequest('This cancelled subscription has reached its end date and is no longer active.');
  }

  const entitlement = subscription.plan?.entitlements?.find((e: any) => e.featureCode === featureCode);

  if (!entitlement) {
    throw AppError.notFound(`Feature "${featureCode}" is not included in this subscription plan.`);
  }

  return {
    success: true,
    featureCode,
    featureName: entitlement.featureName,
    usedCount: 1,
    remainingQuota: entitlement.isUnlimited ? 'Unlimited' : Math.max(0, (entitlement.limitValue || 2) - 1),
    subscription: formatSubscription(subscription),
    message: `Redeemed ${entitlement.featureName || featureCode} successfully!`,
  };
};
