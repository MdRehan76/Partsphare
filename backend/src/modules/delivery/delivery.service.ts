import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';
import { generateAccessToken } from '../../utils/jwt';
import { KYCDocumentType } from '@prisma/client';

// ============================================================================
// HELPER: RESOLVE PARTNER FROM USER
// ============================================================================
export const resolvePartnerByUser = async (userId: string) => {
  let partner = await prisma.deliveryPartner.findUnique({
    where: { userId },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
    },
  });

  if (!partner) {
    // If demo partner fallback
    partner = await prisma.deliveryPartner.findFirst({
      where: { id: 'partner-1' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      },
    });
  }

  if (!partner) {
    throw AppError.notFound('No delivery partner profile associated with this account.');
  }

  return partner;
};

// ============================================================================
// 1. ONBOARDING & AUTHENTICATION
// ============================================================================
export const registerDeliveryPartner = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  vehicleType?: string;
  vehicleNum?: string;
  licenseNumber?: string;
}) => {
  if (!data.email || !data.password || !data.firstName || !data.lastName || !data.phone) {
    throw AppError.badRequest('First name, last name, email, password, and phone number are required.');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (existingUser) {
    throw AppError.conflict('An account with this email address already exists.');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  // 1. Create Delivery Partner User
  const newUser = await prisma.user.create({
    data: {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
      phone: data.phone.trim(),
      role: 'DELIVERY_PARTNER',
      status: 'ACTIVE',
    },
  });

  // 2. Create Partner Profile (Activation pending KYC verification)
  const newPartner = await prisma.deliveryPartner.create({
    data: {
      userId: newUser.id,
      vehicleType: data.vehicleType || 'Bike / Two-Wheeler',
      vehicleNum: data.vehicleNum ? data.vehicleNum.toUpperCase() : null,
      licenseNumber: data.licenseNumber ? data.licenseNumber.toUpperCase() : null,
      isOnline: false,
      isActivated: false,
      verificationStatus: 'PENDING',
      currentLat: 12.9716,
      currentLng: 77.5946,
      rating: 5.0,
      totalDeliveries: 0,
      cashInHand: 0,
    },
  });

  // 3. Initialize KYC container
  const newKyc = await prisma.kYC.create({
    data: {
      userId: newUser.id,
      status: 'NOT_SUBMITTED',
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
    partner: newPartner,
    kyc: newKyc,
    token,
  };
};

export const loginDeliveryPartner = async (data: { email: string; password: string }) => {
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

  const partner = await prisma.deliveryPartner.findFirst({
    where: { userId: user.id },
  }) || (user.role === 'DELIVERY_PARTNER' ? await prisma.deliveryPartner.findFirst({ where: { id: 'partner-1' } }) : null);

  if (!partner) {
    throw AppError.forbidden('No delivery partner profile is registered for this account.');
  }

  const kyc = await prisma.kYC.findUnique({
    where: { userId: user.id },
    include: { documents: true },
  }) || await prisma.kYC.findFirst({ where: { userId: 'rider-user-1' }, include: { documents: true } });

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
    partner,
    kyc,
    token,
  };
};

// ============================================================================
// 2. KYC UPLOAD & ADMIN VERIFICATION
// ============================================================================
export const getKycDetails = async (userId: string) => {
  const kyc = await prisma.kYC.findUnique({
    where: { userId },
    include: { documents: true },
  });

  if (!kyc) {
    // If not found, return empty unsubmitted record
    return {
      status: 'NOT_SUBMITTED',
      documents: [],
      panNumber: null,
      aadharNumber: null,
      rejectionReason: null,
    };
  }

  return kyc;
};

export const uploadKycDocument = async ({
  userId,
  documentType,
  objectKey,
  fileUrl,
  mimeType,
  panNumber,
  aadharNumber,
}: {
  userId: string;
  documentType: KYCDocumentType;
  objectKey?: string;
  fileUrl?: string;
  mimeType?: string;
  panNumber?: string;
  aadharNumber?: string;
}) => {
  // Ensure KYC container exists
  const kyc = await prisma.kYC.upsert({
    where: { userId },
    create: {
      userId,
      status: 'NOT_SUBMITTED',
      panNumber: panNumber || null,
      aadharNumber: aadharNumber || null,
    },
    update: {
      ...(panNumber && { panNumber }),
      ...(aadharNumber && { aadharNumber }),
    },
  });

  const doc = await prisma.kYCDocument.create({
    data: {
      kycId: kyc.id,
      documentType,
      objectKey: objectKey || `kyc/${userId}/${documentType.toLowerCase()}_${Date.now()}.jpg`,
      fileUrl: fileUrl || `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600`,
      mimeType: mimeType || 'image/jpeg',
      verificationStatus: 'PENDING',
    },
  });

  const updatedKyc = await prisma.kYC.findUnique({
    where: { userId },
    include: { documents: true },
  });

  return {
    document: doc,
    kyc: updatedKyc,
  };
};

export const submitKycForReview = async (userId: string) => {
  const kyc = await prisma.kYC.findUnique({
    where: { userId },
    include: { documents: true },
  });

  if (!kyc || !kyc.documents || kyc.documents.length === 0) {
    throw AppError.badRequest('Please upload at least one required KYC document (Driving License or Govt ID) before submitting.');
  }

  const updatedKyc = await prisma.kYC.update({
    where: { userId },
    data: {
      status: 'PENDING',
      rejectionReason: null,
      reviewedAt: null,
    },
  });

  await prisma.deliveryPartner.update({
    where: { userId },
    data: {
      verificationStatus: 'PENDING',
    },
  });

  return updatedKyc;
};

export const adminVerifyKyc = async (
  userId: string,
  data: { status: 'APPROVED' | 'REJECTED'; rejectionReason?: string }
) => {
  if (!['APPROVED', 'REJECTED'].includes(data.status)) {
    throw AppError.badRequest('Verification status must be either APPROVED or REJECTED.');
  }

  const isApproved = data.status === 'APPROVED';

  const updatedKyc = await prisma.kYC.update({
    where: { userId },
    data: {
      status: data.status,
      rejectionReason: isApproved ? null : data.rejectionReason || 'Documents did not meet criteria.',
      reviewedAt: new Date(),
      reviewedBy: 'admin-compliance-desk',
    },
  });

  // Activate or Deactivate partner
  const updatedPartner = await prisma.deliveryPartner.update({
    where: { userId },
    data: {
      isActivated: isApproved,
      verificationStatus: data.status,
    },
  });

  return {
    kyc: updatedKyc,
    partner: updatedPartner,
  };
};

// ============================================================================
// 3. DUTY TOGGLE & PARTNER PROFILE
// ============================================================================
export const getDeliveryProfile = async (userId: string) => {
  const partner = await resolvePartnerByUser(userId);
  const kyc = await prisma.kYC.findUnique({
    where: { userId: partner.userId },
    include: { documents: true },
  });

  return {
    ...partner,
    kyc,
  };
};

export const updateDeliveryProfile = async (userId: string, data: any) => {
  const partner = await resolvePartnerByUser(userId);

  const updated = await prisma.deliveryPartner.update({
    where: { id: partner.id },
    data: {
      ...(data.vehicleType && { vehicleType: data.vehicleType }),
      ...(data.vehicleNum && { vehicleNum: data.vehicleNum.toUpperCase() }),
      ...(data.licenseNumber && { licenseNumber: data.licenseNumber.toUpperCase() }),
      ...(data.currentLat !== undefined && { currentLat: Number(data.currentLat) }),
      ...(data.currentLng !== undefined && { currentLng: Number(data.currentLng) }),
    },
  });

  return updated;
};

export const toggleDutyStatus = async (userId: string, isOnline: boolean) => {
  const partner = await resolvePartnerByUser(userId);

  if (isOnline && !partner.isActivated) {
    throw AppError.badRequest('Cannot go online. Your profile is pending KYC verification and admin activation.');
  }

  const updated = await prisma.deliveryPartner.update({
    where: { id: partner.id },
    data: { isOnline: Boolean(isOnline) },
  });

  return updated;
};

// ============================================================================
// 4. DELIVERY DASHBOARD & METRICS
// ============================================================================
export const getDeliveryDashboard = async (userId: string) => {
  const partner = await resolvePartnerByUser(userId);

  const [allAssignments, partnerReconciliations, kyc] = await Promise.all([
    prisma.deliveryAssignment.findMany(),
    prisma.cODReconciliation.findMany({ where: { deliveryPartnerId: partner.id } }),
    prisma.kYC.findUnique({ where: { userId: partner.userId }, include: { documents: true } }),
  ]);

  // Available jobs: ASSIGNED and either unclaimed (deliveryPartnerId === null) or specifically assigned to this partner
  const availableJobs = allAssignments.filter(
    (a: any) => a.status === 'ASSIGNED' && (a.deliveryPartnerId === null || a.deliveryPartnerId === partner.id)
  );

  // Partner's active in-progress trips
  const activeTrips = allAssignments.filter(
    (a: any) => a.deliveryPartnerId === partner.id && ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'].includes(a.status)
  );

  // Partner's completed deliveries
  const completedTrips = allAssignments.filter(
    (a: any) => a.deliveryPartnerId === partner.id && a.status === 'DELIVERED'
  );

  // Used-Part Pickups
  const usedPartPickups = allAssignments.filter(
    (a: any) => a.deliveryPartnerId === partner.id && a.type === 'USED_PART_PICKUP'
  );

  // COD Cash Calculations:
  // Find all deliveries completed by this partner with cash collected but not yet reconciled
  const codUnreconciledJobs = allAssignments.filter(
    (a: any) => a.deliveryPartnerId === partner.id && a.codStatus === 'COLLECTED'
  );
  const pendingCashInHand = codUnreconciledJobs.reduce((sum: number, j: any) => sum + Number(j.codAmountCollected || 0), 0);

  // Total earnings estimate
  const totalTripEarnings = completedTrips.reduce((sum: number, j: any) => sum + Number(j.deliveryFee || 0), 0);

  return {
    partner: {
      id: partner.id,
      name: partner.user ? `${partner.user.firstName} ${partner.user.lastName}` : 'Rider',
      email: partner.user?.email,
      phone: partner.user?.phone,
      vehicleType: partner.vehicleType,
      vehicleNum: partner.vehicleNum,
      isOnline: partner.isOnline,
      isActivated: partner.isActivated,
      verificationStatus: partner.verificationStatus,
      rating: partner.rating,
      totalDeliveries: partner.totalDeliveries,
      cashInHand: pendingCashInHand,
    },
    metrics: {
      availableJobsCount: availableJobs.length,
      activeTripsCount: activeTrips.length,
      completedTripsCount: completedTrips.length,
      usedPartPickupsCount: usedPartPickups.length,
      pendingCashInHand,
      totalTripEarnings,
      unreconciledCodJobsCount: codUnreconciledJobs.length,
    },
    activeTrips,
    availableJobs: availableJobs.slice(0, 5),
    recentCompleted: completedTrips.slice(0, 5),
    unreconciledCodJobs: codUnreconciledJobs,
    kycStatus: kyc?.status || 'NOT_SUBMITTED',
  };
};

// ============================================================================
// 5. JOBS & STRICT ISOLATION ACCESS CONTROL
// ============================================================================
export const listAvailableJobs = async (userId: string) => {
  const partner = await resolvePartnerByUser(userId);

  // STRICT ISOLATION: Unassigned jobs (deliveryPartnerId === null) OR jobs assigned to THIS partner.
  // Never returns another partner's assigned jobs.
  const allAssignments = await prisma.deliveryAssignment.findMany();
  const available = allAssignments.filter(
    (a: any) => a.status === 'ASSIGNED' && (a.deliveryPartnerId === null || a.deliveryPartnerId === partner.id)
  );

  return available;
};

export const listMyJobs = async (userId: string, filter?: { status?: string; type?: string }) => {
  const partner = await resolvePartnerByUser(userId);

  // STRICT ISOLATION: ONLY jobs assigned to this specific partner!
  const allAssignments = await prisma.deliveryAssignment.findMany({
    where: { deliveryPartnerId: partner.id },
  });

  let myJobs = allAssignments;
  if (filter?.status) {
    myJobs = myJobs.filter((a: any) => a.status === filter.status);
  }
  if (filter?.type) {
    myJobs = myJobs.filter((a: any) => a.type === filter.type);
  }

  return myJobs;
};

export const getJobById = async (userId: string, jobId: string) => {
  const partner = await resolvePartnerByUser(userId);

  const assignment = await prisma.deliveryAssignment.findUnique({
    where: { id: jobId },
    include: { order: true },
  });

  if (!assignment) {
    throw AppError.notFound('Delivery job not found.');
  }

  // STRICT ACCESS CONTROL:
  // If the job is assigned to another delivery partner, deny access completely!
  if (assignment.deliveryPartnerId && assignment.deliveryPartnerId !== partner.id) {
    throw AppError.forbidden('Forbidden: You do not have permission to access another delivery partner\'s job.');
  }

  return assignment;
};

export const acceptJob = async (userId: string, jobId: string) => {
  const partner = await resolvePartnerByUser(userId);

  if (!partner.isActivated) {
    throw AppError.badRequest('Cannot accept jobs. Your account must be KYC verified and activated by Admin.');
  }
  if (!partner.isOnline) {
    throw AppError.badRequest('Please toggle your status to ONLINE before accepting delivery jobs.');
  }

  const assignment = await prisma.deliveryAssignment.findUnique({
    where: { id: jobId },
  });

  if (!assignment) {
    throw AppError.notFound('Delivery job not found.');
  }

  // STRICT ACCESS CONTROL:
  if (assignment.deliveryPartnerId && assignment.deliveryPartnerId !== partner.id) {
    throw AppError.forbidden('Forbidden: This job has already been claimed by another delivery partner.');
  }

  if (assignment.status !== 'ASSIGNED') {
    throw AppError.badRequest(`Job cannot be accepted from current status: ${assignment.status}`);
  }

  const updated = await prisma.deliveryAssignment.update({
    where: { id: jobId },
    data: {
      deliveryPartnerId: partner.id,
      status: 'ACCEPTED',
      acceptedAt: new Date(),
    },
  });

  // If connected to an order, push tracking update
  if (assignment.orderId) {
    await prisma.orderTracking.create({
      data: {
        orderId: assignment.orderId,
        status: 'ACCEPTED_BY_RIDER',
        message: `Delivery partner ${partner.user ? partner.user.firstName : 'Rider'} has accepted the delivery assignment.`,
      },
    });
  }

  return updated;
};

export const updateJobStatus = async (
  userId: string,
  jobId: string,
  status: 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED',
  notes?: string
) => {
  const partner = await resolvePartnerByUser(userId);

  const assignment = await prisma.deliveryAssignment.findUnique({
    where: { id: jobId },
  });

  if (!assignment) {
    throw AppError.notFound('Delivery job not found.');
  }

  // STRICT ACCESS CONTROL:
  if (assignment.deliveryPartnerId !== partner.id) {
    throw AppError.forbidden('Forbidden: You cannot modify a job assigned to another delivery partner.');
  }

  const updatePayload: any = {
    status,
    ...(notes && { notes }),
  };

  if (status === 'PICKED_UP') {
    updatePayload.pickedUpAt = new Date();
    updatePayload.navigationInfo = {
      currentDistance: '3.4 km to drop location',
      etaMinutes: 12,
      routeSummary: 'En route to customer drop address',
    };
  } else if (status === 'IN_TRANSIT') {
    updatePayload.navigationInfo = {
      currentDistance: '1.2 km away',
      etaMinutes: 4,
      routeSummary: 'Approaching destination',
    };
  } else if (status === 'DELIVERED') {
    updatePayload.deliveredAt = new Date();
    updatePayload.navigationInfo = {
      currentDistance: 'Delivered',
      etaMinutes: 0,
      routeSummary: 'Completed trip',
    };
    // Increment total deliveries for partner
    await prisma.deliveryPartner.update({
      where: { id: partner.id },
      data: { totalDeliveries: (partner.totalDeliveries || 0) + 1 },
    });
  }

  const updatedAssignment = await prisma.deliveryAssignment.update({
    where: { id: jobId },
    data: updatePayload,
  });

  // Real-time status update to Customer Order
  if (assignment.orderId) {
    if (status === 'DELIVERED') {
      await prisma.order.update({
        where: { id: assignment.orderId },
        data: { status: 'DELIVERED' },
      });
      await prisma.orderTracking.create({
        data: {
          orderId: assignment.orderId,
          status: 'DELIVERED',
          message: 'Package successfully delivered to customer doorstep by delivery partner.',
        },
      });
    } else if (status === 'PICKED_UP') {
      await prisma.order.update({
        where: { id: assignment.orderId },
        data: { status: 'SHIPPED' },
      });
      await prisma.orderTracking.create({
        data: {
          orderId: assignment.orderId,
          status: 'OUT_FOR_DELIVERY',
          message: 'Package picked up by delivery partner and is out for doorstep delivery.',
        },
      });
    }
  }

  return updatedAssignment;
};

// ============================================================================
// 6. CASH ON DELIVERY (COD) & RECONCILIATION
// ============================================================================
export const recordCodCollection = async (userId: string, jobId: string, amount?: number) => {
  const partner = await resolvePartnerByUser(userId);

  const assignment = await prisma.deliveryAssignment.findUnique({
    where: { id: jobId },
  });

  if (!assignment) {
    throw AppError.notFound('Delivery job not found.');
  }

  // STRICT ACCESS CONTROL:
  if (assignment.deliveryPartnerId !== partner.id) {
    throw AppError.forbidden('Forbidden: You cannot collect cash for another delivery partner\'s job.');
  }

  const collectedAmount = Number(amount || assignment.codAmountToCollect || 0);

  const updatedAssignment = await prisma.deliveryAssignment.update({
    where: { id: jobId },
    data: {
      codStatus: 'COLLECTED',
      codAmountCollected: collectedAmount,
      collectedAt: new Date(),
    },
  });

  // Update partner's in-hand cash
  await prisma.deliveryPartner.update({
    where: { id: partner.id },
    data: { cashInHand: (partner.cashInHand || 0) + collectedAmount },
  });

  // Mark Customer Order as PAID
  if (assignment.orderId) {
    await prisma.order.update({
      where: { id: assignment.orderId },
      data: { paymentStatus: 'PAID' },
    });

    // Update payment record
    const payment = await prisma.payment.findFirst({
      where: { orderId: assignment.orderId },
    });
    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'PAID' },
      });
    }

    // Release mechanical shop commission if service is completed
    const comm = await prisma.commissionLedger.findFirst({
      where: { orderId: assignment.orderId },
    });
    if (comm) {
      comm.paymentStatus = 'PAID';
      if (comm.serviceStatus === 'COMPLETED') {
        comm.releaseStatus = 'RELEASED';
        comm.payoutStatus = 'RELEASED';
      } else {
        comm.releaseStatus = 'LOCKED_PENDING_COMPLETION';
      }
      await prisma.commissionLedger.update({
        where: { id: comm.id },
        data: {
          paymentStatus: comm.paymentStatus,
          releaseStatus: comm.releaseStatus,
          payoutStatus: comm.payoutStatus,
        },
      });
    }
  }

  return updatedAssignment;
};

export const reconcileCodCash = async (
  userId: string,
  data: {
    amount?: number;
    depositReference?: string;
    hubLocation?: string;
    depositMethod?: string;
    notes?: string;
  }
) => {
  const partner = await resolvePartnerByUser(userId);

  // Find all unreconciled COD deliveries for this partner
  const allAssignments = await prisma.deliveryAssignment.findMany({
    where: { deliveryPartnerId: partner.id },
  });
  const collectedJobs = allAssignments.filter((a: any) => a.codStatus === 'COLLECTED');

  const totalCollected = collectedJobs.reduce((sum: number, j: any) => sum + Number(j.codAmountCollected || 0), 0);
  const reconcileAmount = Number(data.amount || totalCollected);

  if (reconcileAmount <= 0) {
    throw AppError.badRequest('No pending cash collected to reconcile with hub.');
  }

  // Create reconciliation record
  const recon = await prisma.cODReconciliation.create({
    data: {
      deliveryPartnerId: partner.id,
      totalAmount: reconcileAmount,
      orderCount: collectedJobs.length || 1,
      status: 'RECONCILED',
      depositMethod: data.depositMethod || 'CASH_AT_HUB',
      depositReference: data.depositReference || `HUB-DEP-${Date.now().toString().slice(-5)}`,
      hubLocation: data.hubLocation || 'Indiranagar Central Logistics Hub',
      receivedBy: 'Finance Desk Officer',
      notes: data.notes || 'Full cash reconciliation verified and settled.',
    },
  });

  // Update assignments to RECONCILED
  for (const job of collectedJobs) {
    await prisma.deliveryAssignment.update({
      where: { id: job.id },
      data: { codStatus: 'RECONCILED' },
    });
  }

  // Reset partner cash in hand
  await prisma.deliveryPartner.update({
    where: { id: partner.id },
    data: { cashInHand: Math.max(0, (partner.cashInHand || 0) - reconcileAmount) },
  });

  return {
    reconciliation: recon,
    settledJobsCount: collectedJobs.length,
    newCashInHand: Math.max(0, (partner.cashInHand || 0) - reconcileAmount),
  };
};

export const listReconciliations = async (userId: string) => {
  const partner = await resolvePartnerByUser(userId);
  return prisma.cODReconciliation.findMany({
    where: { deliveryPartnerId: partner.id },
  });
};

// ============================================================================
// 7. USED-PART DOORSTEP VERIFICATION & INTAKE
// ============================================================================
export const performUsedPartVerification = async (
  userId: string,
  jobId: string,
  data: {
    conditionGrade: string; // 'A+', 'A', 'B', 'C', 'D'
    inspectionChecklist: Record<string, boolean>;
    photos?: string[];
    result: 'APPROVED' | 'REJECTED';
    notes?: string;
    calculatedValuation?: number;
  }
) => {
  const partner = await resolvePartnerByUser(userId);

  const assignment = await prisma.deliveryAssignment.findUnique({
    where: { id: jobId },
  });

  if (!assignment) {
    throw AppError.notFound('Delivery job not found.');
  }

  // STRICT ACCESS CONTROL:
  if (assignment.deliveryPartnerId !== partner.id) {
    throw AppError.forbidden('Forbidden: You cannot perform inspection on another partner\'s job.');
  }

  if (assignment.type !== 'USED_PART_PICKUP') {
    throw AppError.badRequest('This job is not a Used-Part Pickup job.');
  }

  const isApproved = data.result === 'APPROVED';

  // 1. Update Used Part Listing
  if (assignment.usedPartListingId) {
    const valuation = Number(data.calculatedValuation || 2400);
    await prisma.usedPartListing.update({
      where: { id: assignment.usedPartListingId },
      data: {
        status: isApproved ? 'VALUED' : 'REJECTED',
        verificationStatus: isApproved ? 'VERIFIED' : 'REJECTED',
        conditionGrade: data.conditionGrade,
        finalValuation: isApproved ? valuation : null,
        payoutStatus: isApproved ? 'PAYOUT_PENDING' : 'REJECTED',
        payoutAmount: isApproved ? valuation : 0,
        verificationNotes: data.notes || (isApproved ? 'Doorstep inspection passed.' : 'Doorstep inspection failed condition criteria.'),
        rejectionReason: isApproved ? null : (data.notes || 'Condition failed minimum quality criteria.'),
      },
    });

    // 2. Trigger Seller Payout Record
    if (isApproved) {
      await prisma.usedPartPayout.create({
        data: {
          listingId: assignment.usedPartListingId,
          sellerId: 'demo-user-1',
          amount: valuation,
          payoutStatus: 'PROCESSING',
          payoutMethod: 'UPI_DIRECT',
        },
      });

      // 3. Trigger Shop Inventory Intake manifest event
      await prisma.usedPartIntake.create({
        data: {
          shopId: 'shop-1',
          listingId: assignment.usedPartListingId,
          sellerName: assignment.pickupLocation?.name || 'Customer Seller',
          vehicleModel: assignment.items?.[0]?.title || 'Used Vehicle Component',
          intakeDate: new Date(),
          physicalCondition: data.conditionGrade,
          technicalTestStatus: 'NEEDS_TESTING',
          technicianNotes: `Doorstep verified by rider ${partner.user?.firstName || 'Vikram'}. Grade: ${data.conditionGrade}. Intake at mechanical hub pending bench testing.`,
          status: 'IN_TRANSIT',
        },
      });
    }
  }

  // 4. Update Assignment status
  const updatedAssignment = await prisma.deliveryAssignment.update({
    where: { id: jobId },
    data: {
      status: isApproved ? 'PICKED_UP' : 'FAILED',
      pickedUpAt: isApproved ? new Date() : null,
      notes: data.notes || `Condition Grade: ${data.conditionGrade}. Inspection result: ${data.result}`,
      inspectionChecklist: data.inspectionChecklist,
      conditionGrade: data.conditionGrade,
      verificationResult: data.result,
      inspectionPhotos: data.photos || [],
    },
  });

  return {
    assignment: updatedAssignment,
    verificationResult: data.result,
    conditionGrade: data.conditionGrade,
    sellerPayoutTriggered: isApproved,
    inventoryUpdateEventTriggered: isApproved,
  };
};
