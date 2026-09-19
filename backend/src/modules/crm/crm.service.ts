import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';
import { ReminderType } from '@prisma/client';

export const getVehicleServiceHistory = async (customerVehicleId: string, userId: string) => {
  return prisma.vehicleServiceRecord.findMany({
    where: { customerVehicleId, userId },
    include: { shop: { select: { name: true, city: true } } },
    orderBy: { serviceDate: 'desc' },
  });
};

export const getMaintenanceReminders = async (userId: string) => {
  return prisma.maintenanceReminder.findMany({
    where: { userId, isDismissed: false, isCompleted: false },
    include: {
      customerVehicle: {
        include: {
          variant: {
            include: { model: { include: { make: true } } },
          },
        },
      },
    },
    orderBy: { dueDate: 'asc' },
  });
};
