import { z } from 'zod';

export const getMakesQuerySchema = z.object({
  query: z.object({
    type: z.string().optional(),
  }),
});

export const addVehicleSchema = z.object({
  body: z.object({
    variantId: z.string().min(1, 'Invalid variant ID'),
    nickname: z.string().max(50).optional().nullable(),
    regNumber: z.string().max(20).optional().nullable(),
    isPrimary: z.boolean().optional(),
  }),
});

export const updateVehicleSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Invalid vehicle ID'),
  }),
  body: z.object({
    variantId: z.string().min(1, 'Invalid variant ID').optional(),
    nickname: z.string().max(50).optional().nullable(),
    regNumber: z.string().max(20).optional().nullable(),
    isPrimary: z.boolean().optional(),
  }),
});

export const vehicleIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Invalid vehicle ID'),
  }),
});
