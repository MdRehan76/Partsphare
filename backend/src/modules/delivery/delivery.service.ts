import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';
import { KYCDocumentType } from '@prisma/client';

export const getDeliveryProfile = async (userId: string) => {
  const profile = await prisma.deliveryPartner.findUnique({
    where: { userId },
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true } },
    },
  });
  if (!profile) throw AppError.notFound('Delivery partner profile not found.');
  return profile;
};

/**
 * Register a KYC document reference in secure object storage
 */
export const registerKycDocument = async ({
  userId,
  documentType,
  objectKey,
  fileUrl,
  mimeType,
}: {
  userId: string;
  documentType: KYCDocumentType;
  objectKey: string;
  fileUrl: string;
  mimeType: string;
}) => {
  // Ensure KYC container exists
  const kyc = await prisma.kYC.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  return prisma.kYCDocument.create({
    data: {
      kycId: kyc.id,
      documentType,
      objectKey,
      fileUrl,
      mimeType,
    },
  });
};
