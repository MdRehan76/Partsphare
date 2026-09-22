import crypto from 'crypto';
import prisma from '../../config/prisma';
import config from '../../config/env';
import AppError from '../../utils/AppError';
import { PaymentMethod, PaymentStatus, SubscriptionStatus } from '@prisma/client';

const DEMO_RAZORPAY_KEY_ID = config.razorpay?.keyId && !config.razorpay.keyId.includes('placeholder')
  ? config.razorpay.keyId
  : 'rzp_test_partsphere_demo';

const DEMO_RAZORPAY_SECRET = config.razorpay?.keySecret && !config.razorpay.keySecret.includes('placeholder')
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
    const monthlyPrice = Number(plan.monthlyPrice || plan.price || 499);
    const yearlyPrice = Number(plan.yearlyPrice || Math.round(monthlyPrice * 10));
    const currentPrice = frequency === 'YEARLY' ? yearlyPrice : monthlyPrice;
    const durationDays = frequency === 'YEARLY' ? 365 : 30;
    const savingsPercent = Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100);

    return {
      ...plan,
      monthlyPrice,
      yearlyPrice,
      currentPrice,
      durationDays,
      selectedFrequency: frequency,
      savingsPercent: savingsPercent > 0 ? savingsPercent : 0,
      price: currentPrice,
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

  const monthlyPrice = Number(plan.monthlyPrice || plan.price || 499);
  const yearlyPrice = Number(plan.yearlyPrice || Math.round(monthlyPrice * 10));
  const currentPrice = frequency === 'YEARLY' ? yearlyPrice : monthlyPrice;
  const durationDays = frequency === 'YEARLY' ? 365 : 30;
  const savingsPercent = Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100);

  return {
    ...plan,
    monthlyPrice,
    yearlyPrice,
    currentPrice,
    durationDays,
    selectedFrequency: frequency,
    savingsPercent: savingsPercent > 0 ? savingsPercent : 0,
    price: currentPrice,
  };
};

/**
 * Gets all subscriptions for the authenticated customer (active, cancelled, expired)
 */
export const getUserSubscriptions = async (userId: string) => {
  return prisma.customerSubscription.findMany({
    where: { userId },
    include: {
      plan: {
        include: {
          entitlements: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
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
    },
    orderBy: { createdAt: 'desc' },
  });

  const now = new Date();
  return (
    subscriptions.find(
      (s: any) =>
        s.status === SubscriptionStatus.ACTIVE ||
        (s.status === SubscriptionStatus.CANCELLED && new Date(s.endDate) > now)
    ) || null
  );
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
    paymentMethod?: 'RAZORPAY' | 'CASH_ON_DELIVERY';
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
  const price = isYearly
    ? Number(plan.yearlyPrice || Math.round(Number(plan.price) * 10))
    : Number(plan.monthlyPrice || plan.price);
  const durationDays = isYearly ? 365 : 30;

  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
  const renewalDate = new Date(endDate.getTime());

  if ((paymentMethod as string) === 'CASH_ON_DELIVERY' || (paymentMethod as string) === 'COD') {
    // Immediate activation for COD (Pay on first service visit)
    const subscription = await prisma.customerSubscription.create({
      data: {
        userId,
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        billingCycle,
        pricePaid: price,
        startDate,
        endDate,
        renewalDate,
        autoRenew,
        vehicleId: vehicleId || null,
        vehicleReg: vehicleReg || 'REG-PENDING',
        paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
      },
    });

    await prisma.subscriptionPayment.create({
      data: {
        subscriptionId: subscription.id,
        userId,
        amount: price,
        paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
        method: 'CASH_ON_DELIVERY',
        paymentStatus: PaymentStatus.PENDING,
        status: 'PENDING',
      },
    });

    const activeCodSub = await prisma.customerSubscription.findUnique({
      where: { id: subscription.id },
    });

    return {
      subscription: activeCodSub || subscription,
      requiresOnlinePayment: false,
      message: 'Subscription activated! Payment of ₹' + price + ' scheduled for collection on your first service visit.',
    };
  }

  // Razorpay Sandbox checkout flow
  const razorpayOrderId = `order_sub_sandbox_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const amountInPaise = Math.round(price * 100);

  const subscription = await prisma.customerSubscription.create({
    data: {
      userId,
      planId: plan.id,
      status: SubscriptionStatus.PENDING,
      billingCycle,
      pricePaid: price,
      startDate,
      endDate,
      renewalDate,
      autoRenew,
      vehicleId: vehicleId || null,
      vehicleReg: vehicleReg || 'REG-PENDING',
      paymentMethod: PaymentMethod.RAZORPAY,
      razorpayOrderId,
    },
  });

  return {
    subscription,
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
    },
  };
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
    include: { plan: true },
  });

  if (!subscription) {
    throw AppError.notFound('Subscription record not found.');
  }

  // Idempotency check: If already active with this payment, return success
  if (subscription.status === SubscriptionStatus.ACTIVE && subscription.razorpayPaymentId === razorpayPaymentId) {
    return {
      success: true,
      alreadyProcessed: true,
      subscription,
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

  // Signature valid: Activate subscription
  const updatedSub = await prisma.customerSubscription.update({
    where: { id: subscription.id },
    data: {
      status: SubscriptionStatus.ACTIVE,
      razorpayPaymentId,
      updatedAt: new Date(),
    },
  });

  // Record payment
  await prisma.subscriptionPayment.create({
    data: {
      subscriptionId: subscription.id,
      amount: Number(subscription.pricePaid),
      paymentMethod: PaymentMethod.RAZORPAY,
      paymentStatus: (PaymentStatus as any).PAID || PaymentStatus.CAPTURED,
      razorpayOrderId,
      razorpayPaymentId,
    },
  });

  return {
    success: true,
    subscription: updatedSub,
    message: `🎉 Membership activated! You now have full access to ${subscription.plan?.name || 'PartNexa'} benefits.`,
  };
};

/**
 * Cancels subscription (retains benefits until current endDate, turns off autoRenew)
 */
export const cancelSubscription = async (userId: string, subscriptionId: string, reason?: string) => {
  const subscription = await prisma.customerSubscription.findFirst({
    where: { id: subscriptionId, userId },
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
      cancelledAt: new Date(),
      cancellationReason: reason || 'Cancelled by customer',
      updatedAt: new Date(),
    },
  });

  return {
    success: true,
    subscription: updated,
    message: 'Subscription has been cancelled. Your benefits remain active until ' +
      new Date(updated.endDate).toLocaleDateString() + '.',
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
  });

  return {
    success: true,
    autoRenew: updated.autoRenew,
    subscription: updated,
    message: autoRenew
      ? 'Auto-renewal enabled. Your membership will renew automatically on ' + new Date(updated.renewalDate).toLocaleDateString()
      : 'Auto-renewal disabled. Your membership will expire at the end of the current term.',
  };
};

/**
 * Simulates automated renewal: extends dates, resets entitlements, records renewal payment
 */
export const simulateRenewal = async (userId: string, subscriptionId: string) => {
  const subscription = await prisma.customerSubscription.findFirst({
    where: { id: subscriptionId, userId },
    include: { plan: true },
  });

  if (!subscription) {
    throw AppError.notFound('Subscription not found.');
  }

  const durationDays = subscription.billingCycle === 'YEARLY' ? 365 : 30;
  const currentEnd = new Date(subscription.endDate || Date.now());
  const newStartDate = currentEnd > new Date() ? currentEnd : new Date();
  const newEndDate = new Date(newStartDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
  const newRenewalDate = new Date(newEndDate.getTime());

  const renewedSub = await prisma.customerSubscription.update({
    where: { id: subscription.id },
    data: {
      status: SubscriptionStatus.ACTIVE,
      startDate: newStartDate,
      endDate: newEndDate,
      renewalDate: newRenewalDate,
      autoRenew: true,
      entitlementUsages: {}, // reset usage for new billing period
      updatedAt: new Date(),
    },
  });

  await prisma.subscriptionPayment.create({
    data: {
      subscriptionId: subscription.id,
      amount: Number(subscription.pricePaid),
      paymentMethod: subscription.paymentMethod,
      paymentStatus: (PaymentStatus as any).PAID || PaymentStatus.CAPTURED,
      razorpayOrderId: `renew_${Date.now()}`,
      razorpayPaymentId: `pay_renew_${Date.now()}`,
    },
  });

  return {
    success: true,
    subscription: renewedSub,
    message: 'Subscription renewed successfully until ' + newEndDate.toLocaleDateString() + '!',
  };
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
  });

  return {
    success: true,
    subscription: expiredSub,
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
    include: { plan: { include: { entitlements: true } } },
  });

  if (!subscription) {
    throw AppError.badRequest('No active subscription found to apply this entitlement.');
  }

  if (subscription.status === SubscriptionStatus.CANCELLED && new Date(subscription.endDate) < new Date()) {
    throw AppError.badRequest('This cancelled subscription has reached its end date and is no longer active.');
  }

  const entitlement =
    subscription.entitlements?.find((e: any) => e.featureCode === featureCode) ||
    subscription.plan?.entitlements?.find((e: any) => e.featureCode === featureCode);

  if (!entitlement) {
    throw AppError.notFound(`Feature "${featureCode}" is not included in this subscription plan.`);
  }

  const usages = { ...(subscription.entitlementUsages || {}) };
  const currentUsage = usages[featureCode] || 0;
  const limit = entitlement.limitValue !== undefined && entitlement.limitValue !== null
    ? entitlement.limitValue
    : entitlement.quotaLimit !== undefined && entitlement.quotaLimit !== null
    ? entitlement.quotaLimit
    : null;

  if (!entitlement.isUnlimited && limit !== null && currentUsage >= limit) {
    throw AppError.badRequest(`Entitlement limit reached for ${entitlement.featureName || entitlement.name || featureCode}. Remaining quota: 0.`);
  }

  usages[featureCode] = currentUsage + 1;

  const updatedSub = await prisma.customerSubscription.update({
    where: { id: subscription.id },
    data: {
      entitlementUsages: usages,
      updatedAt: new Date(),
    },
  });

  const remaining = entitlement.isUnlimited || limit === null ? 'Unlimited' : Math.max(0, limit - usages[featureCode]);

  return {
    success: true,
    featureCode,
    featureName: entitlement.featureName,
    usedCount: usages[featureCode],
    remainingQuota: remaining,
    subscription: updatedSub,
  };
};
