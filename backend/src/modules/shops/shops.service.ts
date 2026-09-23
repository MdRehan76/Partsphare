import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';
import { generateAccessToken } from '../../utils/jwt';
import { InventorySyncEngine } from '../inventory/inventorySync.service';

// Helper to resolve shop from authenticated owner
export const resolveShopByOwner = async (ownerId: string) => {
  let shop = await prisma.shop.findFirst({
    where: { ownerId },
  });
  if (!shop) {
    // If demo account fallback
    shop = await prisma.shop.findFirst({
      where: { id: 'shop-1' },
    });
  }
  if (!shop) {
    throw AppError.notFound('No shop associated with this owner account.');
  }
  return shop;
};

export const listVerifiedShops = async (city?: string) => {
  return prisma.shop.findMany({
    where: {
      isVerified: true,
      isActive: true,
      ...(city && { city: { equals: city, mode: 'insensitive' } }),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      phone: true,
      city: true,
      state: true,
      pincode: true,
      rating: true,
      totalRatings: true,
      serviceAvailable: true,
      logoUrl: true,
      address: true,
      latitude: true,
      longitude: true,
      supportedDIFMTypes: true,
      servicesOffered: true,
      vehicleCategories: true,
      commissionRate: true,
    },
    orderBy: { rating: 'desc' },
  });
};

export const getShopBySlug = async (slug: string) => {
  const shop = await prisma.shop.findUnique({
    where: { slug },
    include: {
      owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      inventories: {
        where: { isAvailable: true },
        include: { product: { include: { images: true } } },
        take: 20,
      },
    },
  });
  if (!shop) throw AppError.notFound('Shop not found.');
  return shop;
};

// ============================================================================
// SHOP ONBOARDING & AUTHENTICATION
// ============================================================================

export const registerShop = async (data: {
  name: string;
  ownerFirstName: string;
  ownerLastName: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  city: string;
  state?: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  servicesOffered?: string[];
  vehicleCategories?: string[];
  commissionRate?: number;
  operatingHours?: string;
}) => {
  if (!data.name || !data.email || !data.password || !data.phone || !data.address || !data.city || !data.pincode) {
    throw AppError.badRequest('Missing required shop registration details.');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });
  if (existingUser) {
    throw AppError.conflict('An account with this email address already exists.');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newUser = await prisma.user.create({
    data: {
      firstName: data.ownerFirstName || data.name.split(' ')[0],
      lastName: data.ownerLastName || 'Owner',
      email: data.email.toLowerCase(),
      password: hashedPassword,
      phone: data.phone,
      role: 'SHOP_OWNER',
      status: 'ACTIVE',
    },
  });

  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const rate = data.commissionRate ? Math.max(10, Math.min(15, Number(data.commissionRate))) : 12;

  const newShop = await prisma.shop.create({
    data: {
      name: data.name,
      slug,
      ownerId: newUser.id,
      ownerName: `${newUser.firstName} ${newUser.lastName}`,
      email: data.email.toLowerCase(),
      phone: data.phone,
      address: data.address,
      addressLine1: data.address,
      city: data.city,
      state: data.state || 'Karnataka',
      pincode: data.pincode,
      latitude: data.latitude ? Number(data.latitude) : 12.9716,
      longitude: data.longitude ? Number(data.longitude) : 77.5946,
      servicesOffered: data.servicesOffered || ['Brake Fitment', 'Battery Replacement', 'Doorstep Mechanic'],
      vehicleCategories: data.vehicleCategories || ['CAR', 'BIKE', 'SCOOTER'],
      commissionRate: rate,
      verificationStatus: 'VERIFIED',
      isVerified: true,
      operatingHours: data.operatingHours || '08:30 AM - 08:30 PM',
      supportedDIFMTypes: ['HOME_INSTALLATION', 'SHOP_INSTALLATION'],
    },
  });

  const token = generateAccessToken({
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
  });

  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
    },
    shop: newShop,
    token,
  };
};

export const loginShop = async (data: { email: string; password: string }) => {
  if (!data.email || !data.password) {
    throw AppError.badRequest('Email and password are required.');
  }

  const user = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (!user) {
    throw AppError.unauthorized('Invalid email or password.');
  }

  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) {
    throw AppError.unauthorized('Invalid email or password.');
  }

  const shop = await prisma.shop.findFirst({
    where: { ownerId: user.id },
  }) || (user.role === 'SHOP_OWNER' ? await prisma.shop.findFirst({ where: { id: 'shop-1' } }) : null);

  if (!shop) {
    throw AppError.forbidden('No mechanical shop is registered for this account.');
  }

  const token = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    shop,
    token,
    accessToken: token,
    refreshToken: token,
  };
};

// ============================================================================
// PROFILE & SHOP SETTINGS
// ============================================================================

export const getShopProfile = async (ownerId: string) => {
  const shop = await resolveShopByOwner(ownerId);
  const owner = await prisma.user.findUnique({
    where: { id: shop.ownerId || ownerId },
    select: { id: true, firstName: true, lastName: true, email: true, phone: true },
  });
  return { ...shop, owner };
};

export const updateShopProfile = async (ownerId: string, data: any) => {
  const shop = await resolveShopByOwner(ownerId);
  const updated = await prisma.shop.update({
    where: { id: shop.id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.phone && { phone: data.phone }),
      ...(data.operatingHours && { operatingHours: data.operatingHours }),
      ...(data.servicesOffered && { servicesOffered: data.servicesOffered }),
      ...(data.vehicleCategories && { vehicleCategories: data.vehicleCategories }),
      ...(data.commissionRate !== undefined && { commissionRate: Math.max(10, Math.min(15, Number(data.commissionRate))) }),
      ...(data.address && { address: data.address, addressLine1: data.address }),
      ...(data.city && { city: data.city }),
      ...(data.state && { state: data.state }),
      ...(data.pincode && { pincode: data.pincode }),
      ...(data.latitude !== undefined && { latitude: Number(data.latitude) }),
      ...(data.longitude !== undefined && { longitude: Number(data.longitude) }),
    },
  });
  return updated;
};

// ============================================================================
// SHOP DASHBOARD & METRICS
// ============================================================================

export const getShopDashboard = async (ownerId: string) => {
  const shop = await resolveShopByOwner(ownerId);

  const [jobs, deliveries, intakes, ledgers] = await Promise.all([
    prisma.shopJob.findMany({ where: { shopId: shop.id } }),
    prisma.shopDelivery.findMany({ where: { shopId: shop.id } }),
    prisma.usedPartIntake.findMany({ where: { shopId: shop.id } }),
    prisma.commissionLedger.findMany({ where: { shopId: shop.id } }),
  ]);

  const scheduled = jobs.filter((j: any) => j.status === 'SCHEDULED').length;
  const accepted = jobs.filter((j: any) => j.status === 'ACCEPTED').length;
  const inProgress = jobs.filter((j: any) => j.status === 'IN_PROGRESS').length;
  const completed = jobs.filter((j: any) => j.status === 'COMPLETED').length;
  const cancelled = jobs.filter((j: any) => j.status === 'CANCELLED').length;

  const vehicleVisits = jobs.filter(
    (j: any) => j.jobType === 'DIFM_SHOP_VISIT' || j.jobType === 'CUSTOMER_VEHICLE_VISIT'
  ).length;

  // Compute Commission Metrics
  let totalGross = 0;
  let platformCut = 0;
  let netEarnings = 0;
  let releasedForPayout = 0;
  let lockedPendingCompletion = 0;
  let lockedPendingPayment = 0;
  let alreadyPaidOut = 0;

  for (const c of ledgers) {
    const gross = Number(c.grossAmount || 0);
    const comm = Number(c.commissionAmount || 0);
    const payout = Number(c.shopPayout || 0);

    totalGross += gross;
    platformCut += comm;
    netEarnings += payout;

    if (c.payoutStatus === 'PAID_OUT') {
      alreadyPaidOut += payout;
    } else if (c.releaseStatus === 'RELEASED') {
      releasedForPayout += payout;
    } else if (c.releaseStatus === 'LOCKED_PENDING_PAYMENT') {
      lockedPendingPayment += payout;
    } else {
      lockedPendingCompletion += payout;
    }
  }

  // Today's upcoming services
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingToday = jobs
    .filter((j: any) => {
      if (!j.scheduledDate) return false;
      const jDate = new Date(j.scheduledDate).toISOString().split('T')[0];
      return jDate === todayStr && j.status !== 'COMPLETED' && j.status !== 'CANCELLED';
    })
    .slice(0, 5);

  return {
    shop: {
      id: shop.id,
      name: shop.name,
      rating: shop.rating,
      verificationStatus: shop.verificationStatus || 'VERIFIED',
      commissionRate: shop.commissionRate || 12,
      servicesOffered: shop.servicesOffered || [],
      vehicleCategories: shop.vehicleCategories || [],
      address: shop.address,
      city: shop.city,
    },
    jobStatusCounts: {
      scheduled,
      accepted,
      inProgress,
      completed,
      cancelled,
      total: jobs.length,
    },
    deliveries: {
      total: deliveries.length,
      pending: deliveries.filter((d: any) => d.status !== 'DELIVERED').length,
      recent: deliveries.slice(0, 4),
    },
    usedPartsIntake: {
      total: intakes.length,
      pendingVerification: intakes.filter((i: any) => i.technicalTestStatus === 'NEEDS_TESTING').length,
      recent: intakes.slice(0, 4),
    },
    customerVehicleVisits: vehicleVisits,
    upcomingToday,
    recentJobs: jobs.slice(0, 6),
    earnings: {
      totalGross,
      platformCut,
      netEarnings,
      releasedForPayout,
      lockedPendingCompletion,
      lockedPendingPayment,
      alreadyPaidOut,
      commissionRate: shop.commissionRate || 12,
    },
  };
};

// ============================================================================
// SERVICE CALENDAR & JOB LIFECYCLE
// ============================================================================

export const getServiceCalendar = async (
  ownerId: string,
  query: { status?: string; date?: string; jobType?: string }
) => {
  const shop = await resolveShopByOwner(ownerId);
  const jobs = await prisma.shopJob.findMany({
    where: {
      shopId: shop.id,
      ...(query.status && { status: query.status }),
      ...(query.jobType && { jobType: query.jobType }),
    },
    orderBy: { scheduledDate: 'asc' },
  });

  if (query.date) {
    const target = query.date;
    return jobs.filter((j: any) => {
      const d = new Date(j.scheduledDate).toISOString().split('T')[0];
      return d === target;
    });
  }

  return jobs;
};

export const updateJobStatus = async (
  ownerId: string,
  jobId: string,
  status: string,
  notes?: string
) => {
  const shop = await resolveShopByOwner(ownerId);
  const job = await prisma.shopJob.findUnique({
    where: { id: jobId },
  });

  if (!job || job.shopId !== shop.id) {
    throw AppError.notFound('Job not found for this shop.');
  }

  const validStatuses = ['SCHEDULED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    throw AppError.badRequest(`Invalid job status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const updatePayload: any = {
    status,
    ...(notes && { notes: notes }),
  };

  if (status === 'IN_PROGRESS' && !job.startedAt) {
    updatePayload.startedAt = new Date();
  } else if (status === 'COMPLETED') {
    updatePayload.completedAt = new Date();
  }

  const updatedJob = await prisma.shopJob.update({
    where: { id: jobId },
    data: updatePayload,
  });

  // Sync related DIFM request status if exists
  if (job.difmRequestId) {
    await prisma.difmRequest.update({
      where: { id: job.difmRequestId },
      data: {
        status: status === 'COMPLETED' ? 'COMPLETED' : status === 'CANCELLED' ? 'CANCELLED' : 'ACCEPTED',
      },
    });
  }

  // Push tracking update to Customer order
  if (job.orderId) {
    try {
      if (status === 'IN_PROGRESS') {
        await prisma.orderTracking.create({
          data: {
            orderId: job.orderId,
            status: 'DIFM_IN_PROGRESS',
            message: `Workshop technician at ${shop.name} has started part installation.`,
          },
        });
      } else if (status === 'COMPLETED') {
        await prisma.orderTracking.create({
          data: {
            orderId: job.orderId,
            status: 'DIFM_COMPLETED',
            message: `DIFM professional part installation completed and tested by ${shop.name}.`,
          },
        });
      }
    } catch {}
  }

  // Fetch updated commission ledger status
  const commissionEntry = await prisma.commissionLedger.findFirst({
    where: { jobId },
  });

  return {
    job: updatedJob,
    commissionStatus: commissionEntry
      ? {
          id: commissionEntry.id,
          grossAmount: commissionEntry.grossAmount,
          shopPayout: commissionEntry.shopPayout,
          commissionAmount: commissionEntry.commissionAmount,
          serviceStatus: commissionEntry.serviceStatus,
          paymentStatus: commissionEntry.paymentStatus,
          releaseStatus: commissionEntry.releaseStatus,
          payoutStatus: commissionEntry.payoutStatus,
        }
      : null,
  };
};

// ============================================================================
// COMMISSION SYSTEM & LEDGER
// ============================================================================

export const getCommissionLedger = async (ownerId: string) => {
  const shop = await resolveShopByOwner(ownerId);
  const items = await prisma.commissionLedger.findMany({
    where: { shopId: shop.id },
  });

  let totalGross = 0;
  let platformCommission = 0;
  let netEarnings = 0;
  let releasedForPayout = 0;
  let lockedPendingCompletion = 0;
  let lockedPendingPayment = 0;
  let alreadyPaidOut = 0;

  for (const c of items) {
    const gross = Number(c.grossAmount || 0);
    const comm = Number(c.commissionAmount || 0);
    const payout = Number(c.shopPayout || 0);

    totalGross += gross;
    platformCommission += comm;
    netEarnings += payout;

    if (c.payoutStatus === 'PAID_OUT') {
      alreadyPaidOut += payout;
    } else if (c.releaseStatus === 'RELEASED') {
      releasedForPayout += payout;
    } else if (c.releaseStatus === 'LOCKED_PENDING_PAYMENT') {
      lockedPendingPayment += payout;
    } else {
      lockedPendingCompletion += payout;
    }
  }

  return {
    shopId: shop.id,
    shopName: shop.name,
    commissionRate: shop.commissionRate || 12,
    summary: {
      totalGross,
      platformCommission,
      netEarnings,
      releasedForPayout,
      lockedPendingCompletion,
      lockedPendingPayment,
      alreadyPaidOut,
    },
    items,
  };
};

export const requestCommissionPayout = async (ownerId: string) => {
  const shop = await resolveShopByOwner(ownerId);
  const items = await prisma.commissionLedger.findMany({
    where: {
      shopId: shop.id,
      releaseStatus: 'RELEASED',
      payoutStatus: 'RELEASED',
    },
  });

  if (!items.length) {
    throw AppError.badRequest(
      'No released commissions are currently eligible for payout. Strict Rule: Commission is ONLY released after BOTH service is completed AND customer payment has cleared.'
    );
  }

  const totalPayout = items.reduce((sum: number, it: any) => sum + Number(it.shopPayout || 0), 0);
  const payoutRef = 'PO-APX-' + Math.floor(100000 + Math.random() * 900000);
  const paidAt = new Date();

  for (const it of items) {
    await prisma.commissionLedger.update({
      where: { id: it.id },
      data: {
        payoutStatus: 'PAID_OUT',
        payoutRef,
        paidAt,
      },
    });
  }

  return {
    success: true,
    message: `Payout request of ₹${totalPayout.toLocaleString('en-IN')} approved and settled successfully.`,
    payoutRef,
    totalPayout,
    itemsCount: items.length,
    settledAt: paidAt,
  };
};

// ============================================================================
// INCOMING DELIVERIES
// ============================================================================

export const listIncomingDeliveries = async (ownerId: string) => {
  const shop = await resolveShopByOwner(ownerId);
  return prisma.shopDelivery.findMany({
    where: { shopId: shop.id },
  });
};

export const receiveDelivery = async (
  ownerId: string,
  deliveryId: string,
  receivedBy: string
) => {
  const shop = await resolveShopByOwner(ownerId);
  const del = await prisma.shopDelivery.findUnique({
    where: { id: deliveryId },
  });

  if (!del || del.shopId !== shop.id) {
    throw AppError.notFound('Delivery record not found.');
  }

  const updated = await prisma.shopDelivery.update({
    where: { id: deliveryId },
    data: {
      status: 'DELIVERED',
      receivedAt: new Date(),
      receivedBy: receivedBy || 'Shop Inventory Manager',
    },
  });

  return updated;
};

// ============================================================================
// USED-PART INTAKE & VERIFICATION
// ============================================================================

export const listUsedPartIntakes = async (ownerId: string) => {
  const shop = await resolveShopByOwner(ownerId);
  return prisma.usedPartIntake.findMany({
    where: { shopId: shop.id },
  });
};

export const recordUsedPartIntake = async (ownerId: string, data: any) => {
  const shop = await resolveShopByOwner(ownerId);
  const newIntake = await prisma.usedPartIntake.create({
    data: {
      shopId: shop.id,
      listingId: data.listingId || 'used-' + Date.now().toString().slice(-6),
      partTitle: data.partTitle,
      sellerName: data.sellerName || 'Customer Dropped Off',
      vehicleModel: data.vehicleModel || 'Universal',
      physicalCondition: data.physicalCondition || 'GOOD',
      technicalTestStatus: data.technicalTestStatus || 'PASSED',
      technicianNotes: data.technicianNotes || 'Bench tested and verified operational.',
      status: data.status || 'VERIFIED_ACCEPTED',
    },
  });
  return newIntake;
};

// ============================================================================
// SHOP SUPPORT TICKETS
// ============================================================================

export const listShopTickets = async (ownerId: string) => {
  const shop = await resolveShopByOwner(ownerId);
  return prisma.shopTicket.findMany({
    where: { shopId: shop.id },
  });
};

export const createShopTicket = async (
  ownerId: string,
  data: { category: string; subject: string; priority?: string; message: string }
) => {
  const shop = await resolveShopByOwner(ownerId);
  if (!data.category || !data.subject || !data.message) {
    throw AppError.badRequest('Category, subject, and message are required.');
  }

  const newTicket = await prisma.shopTicket.create({
    data: {
      shopId: shop.id,
      category: data.category,
      subject: data.subject,
      priority: data.priority || 'MEDIUM',
      status: 'OPEN',
      messages: [
        {
          id: 'msg-' + Date.now(),
          senderName: shop.ownerName || 'Shop Owner',
          senderRole: 'SHOP_OWNER',
          message: data.message,
          createdAt: new Date(),
        },
      ],
    },
  });

  return newTicket;
};

export const addTicketMessage = async (
  ownerId: string,
  ticketId: string,
  message: string,
  senderName?: string
) => {
  const shop = await resolveShopByOwner(ownerId);
  const ticket = await prisma.shopTicket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket || ticket.shopId !== shop.id) {
    throw AppError.notFound('Support ticket not found.');
  }

  const updatedMessages = [
    ...(ticket.messages || []),
    {
      id: 'msg-' + Date.now(),
      senderName: senderName || shop.ownerName || 'Shop Owner',
      senderRole: 'SHOP_OWNER',
      message,
      createdAt: new Date(),
    },
  ];

  const updated = await prisma.shopTicket.update({
    where: { id: ticketId },
    data: {
      messages: updatedMessages,
      status: ticket.status === 'RESOLVED' ? 'IN_PROGRESS' : ticket.status,
    },
  });

  return updated;
};

// ============================================================================
// SHOP INVENTORY MANAGEMENT
// ============================================================================

export const getShopInventory = async (ownerId: string) => {
  const shop = await resolveShopByOwner(ownerId);
  const inventories = await prisma.inventory.findMany({
    where: { shopId: shop.id },
  });

  // Enrich with product details
  const enriched = await Promise.all(
    inventories.map(async (inv: any) => {
      const prod = await prisma.product.findUnique({
        where: { id: inv.productId },
        select: {
          id: true,
          name: true,
          slug: true,
          brand: true,
          partNumber: true,
          sku: true,
          basePrice: true,
          category: { select: { name: true } },
          images: true,
        },
      });
      return {
        ...inv,
        product: prod,
        shop: { id: shop.id, name: shop.name, city: shop.city },
      };
    })
  );

  return enriched;
};

export const updateShopStock = async (
  ownerId: string,
  inventoryId: string,
  quantity: number,
  lowStockThreshold?: number
) => {
  const shop = await resolveShopByOwner(ownerId);
  const inv = await prisma.inventory.findUnique({ where: { id: inventoryId } });
  if (!inv) throw AppError.notFound('Inventory record not found.');
  if (inv.shopId !== shop.id) {
    throw AppError.forbidden('You do not have permission to manage this inventory record.');
  }

  return InventorySyncEngine.adjustStock(
    inventoryId,
    quantity,
    `Workshop stock adjustment by ${shop.name}`,
    `SHOP:${shop.name}`,
    lowStockThreshold
  );
};

