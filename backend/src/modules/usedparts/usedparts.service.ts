import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';

export enum UsedPartStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  VERIFICATION_PENDING = 'VERIFICATION_PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  VALUED = 'VALUED',
  PAYOUT_PENDING = 'PAYOUT_PENDING',
  PAID = 'PAID',
  LISTED = 'LISTED',
  SOLD = 'SOLD',
  CANCELLED = 'CANCELLED',
}

export interface CreateUsedPartInput {
  title?: string;
  partName?: string;
  partNumber?: string;
  vehicleModel: string;
  vehicleId?: string;
  category?: string;
  condition: string;
  description: string;
  purchaseAge?: string;
  expectedPrice: number | string;
  images?: string[];
  location: string;
  pickupAddress?: string;
  payoutMethod?: string;
  payoutUpiId?: string;
  payoutBankAccount?: string;
}

// Calculate estimated valuation based on expected price and condition
export const calculateEstimatedValuation = (expectedPrice: number, condition: string): number => {
  const normCondition = (condition || '').toUpperCase();
  let multiplier = 0.75;
  if (normCondition === 'LIKE_NEW' || normCondition === 'EXCELLENT') {
    multiplier = 0.85;
  } else if (normCondition === 'GOOD' || normCondition === 'VERY_GOOD') {
    multiplier = 0.78;
  } else if (normCondition === 'FAIR') {
    multiplier = 0.65;
  } else if (normCondition === 'FOR_PARTS') {
    multiplier = 0.50;
  }
  return Math.round(expectedPrice * multiplier);
};

// Create a new used part listing submitted for verification
export const createUsedPartListing = async (sellerId: string, input: CreateUsedPartInput) => {
  const title = (input.title || input.partName || '').trim();
  if (!title || title.length < 3) {
    throw new AppError('Part name is required (minimum 3 characters).', 400);
  }

  const vehicleModel = (input.vehicleModel || '').trim();
  if (!vehicleModel) {
    throw new AppError('Vehicle specification is required (Make, Model, and Year).', 400);
  }

  const expectedPriceNum = Number(input.expectedPrice);
  if (isNaN(expectedPriceNum) || expectedPriceNum <= 0) {
    throw new AppError('Please provide a valid expected price greater than ₹0.', 400);
  }

  const condition = (input.condition || '').toUpperCase().trim();
  const validConditions = ['LIKE_NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'FOR_PARTS'];
  if (!condition || !validConditions.includes(condition)) {
    throw new AppError(`Condition must be one of: ${validConditions.join(', ')}.`, 400);
  }

  const description = (input.description || '').trim();
  if (!description || description.length < 10) {
    throw new AppError('Description is required (minimum 10 characters detailing condition and history).', 400);
  }

  const location = (input.location || '').trim();
  if (!location) {
    throw new AppError('Pickup location/city is required for verification logistics.', 400);
  }

  const images = Array.isArray(input.images) ? input.images.filter(Boolean) : [];

  const estimatedValuation = calculateEstimatedValuation(expectedPriceNum, condition);

  const listing = await prisma.usedPartListing.create({
    data: {
      sellerId,
      title,
      partNumber: input.partNumber?.trim() || null,
      vehicleModel,
      vehicleId: input.vehicleId || null,
      category: input.category || 'PARTS',
      condition,
      conditionGrade: null,
      description,
      purchaseAge: input.purchaseAge?.trim() || '1-2 Years',
      expectedPrice: expectedPriceNum,
      askingPrice: expectedPriceNum,
      estimatedValuation,
      finalValuation: null,
      payoutStatus: 'PENDING',
      payoutAmount: 0,
      payoutMethod: input.payoutMethod || 'UPI',
      payoutTransactionRef: null,
      images,
      location,
      pickupAddress: input.pickupAddress?.trim() || location,
      status: UsedPartStatus.SUBMITTED,
      verificationStatus: 'SUBMITTED',
      verificationNotes: 'Part listing submitted. PartSphere courier pickup will be scheduled within 24-48 hours.',
      rejectionReason: null,
      isSold: false,
    },
  });

  return listing;
};

// Get listings submitted by the logged-in customer
export const getCustomerListings = async (sellerId: string, statusFilter?: string) => {
  const where: any = { sellerId };
  if (statusFilter && statusFilter !== 'ALL') {
    where.status = statusFilter;
  }

  const listings = await prisma.usedPartListing.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return listings;
};

// Get a single listing by ID owned by the customer
export const getCustomerListingById = async (sellerId: string, listingId: string) => {
  const listing = await prisma.usedPartListing.findUnique({
    where: { id: listingId },
    include: { seller: true },
  });

  if (!listing) {
    throw new AppError('Used part listing not found.', 404);
  }

  if (listing.sellerId !== sellerId) {
    throw new AppError('You do not have permission to view this listing.', 403);
  }

  return listing;
};

// Cancel a customer listing if still in submitted or pending verification state
export const cancelCustomerListing = async (sellerId: string, listingId: string, reason?: string) => {
  const listing = await prisma.usedPartListing.findUnique({
    where: { id: listingId },
  });

  if (!listing) {
    throw new AppError('Used part listing not found.', 404);
  }

  if (listing.sellerId !== sellerId) {
    throw new AppError('You do not have permission to modify this listing.', 403);
  }

  const nonCancellable = [
    UsedPartStatus.VERIFIED,
    UsedPartStatus.VALUED,
    UsedPartStatus.PAYOUT_PENDING,
    UsedPartStatus.PAID,
    UsedPartStatus.LISTED,
    UsedPartStatus.SOLD,
  ];

  if (nonCancellable.includes(listing.status)) {
    throw new AppError(
      `Cannot cancel listing once verified or processed. Current status is ${listing.status}. Please contact support.`,
      400
    );
  }

  if (listing.status === UsedPartStatus.CANCELLED) {
    throw new AppError('Listing is already cancelled.', 400);
  }

  const updated = await prisma.usedPartListing.update({
    where: { id: listingId },
    data: {
      status: UsedPartStatus.CANCELLED,
      verificationStatus: 'CANCELLED',
      verificationNotes: reason ? `Cancelled by seller: ${reason}` : 'Cancelled by seller.',
    },
  });

  return updated;
};

// Public marketplace: list verified and relisted used parts for buyers
export const listVerifiedUsedParts = async (options?: {
  category?: string;
  condition?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}) => {
  const page = Math.max(1, Number(options?.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(options?.limit) || 12));
  const skip = (page - 1) * limit;

  const where: any = {
    status: UsedPartStatus.LISTED,
    isSold: false,
  };

  if (options?.category && options.category !== 'ALL') {
    where.category = options.category;
  }

  let listings = await prisma.usedPartListing.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  // In-memory filter for search / price / condition
  if (options?.search) {
    const q = options.search.toLowerCase();
    listings = listings.filter(
      (item: any) =>
        item.title?.toLowerCase().includes(q) ||
        item.vehicleModel?.toLowerCase().includes(q) ||
        item.partNumber?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
    );
  }

  if (options?.condition && options.condition !== 'ALL') {
    listings = listings.filter((item: any) => item.condition === options.condition);
  }

  if (options?.minPrice !== undefined) {
    listings = listings.filter((item: any) => (item.expectedPrice || item.askingPrice) >= Number(options.minPrice));
  }

  if (options?.maxPrice !== undefined) {
    listings = listings.filter((item: any) => (item.expectedPrice || item.askingPrice) <= Number(options.maxPrice));
  }

  const total = listings.length;
  const paginated = listings.slice(skip, skip + limit);

  return {
    listings: paginated,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

// Public: get a single verified used part
export const getPublicUsedPartById = async (id: string) => {
  const listing = await prisma.usedPartListing.findUnique({
    where: { id },
    include: { seller: true },
  });

  if (!listing) {
    throw new AppError('Used part not found.', 404);
  }

  return listing;
};
