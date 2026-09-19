import { z } from 'zod';

export const registerSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, 'Name is required').max(100).optional(),
      firstName: z.string().min(1, 'First name is required').max(50).optional(),
      lastName: z.string().max(50).optional(),
      email: z.string().email('Invalid email address'),
      password: z.string().min(8, 'Password must be at least 8 characters long'),
      confirmPassword: z.string().optional(),
      phone: z.string().optional(),
      mobileNumber: z.string().optional(),
    })
    .refine(
      (data) => Boolean(data.name || data.firstName),
      {
        message: 'Name is required',
        path: ['name'],
      }
    )
    .refine(
      (data) => !data.confirmPassword || data.password === data.confirmPassword,
      {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      }
    ),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
  }),
});
