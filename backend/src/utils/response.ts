import { Response } from 'express';

export const successResponse = (
  res: Response,
  data: any = null,
  message = 'Success',
  statusCode = 200,
  meta: Record<string, any> = {}
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(Object.keys(meta).length > 0 && { meta }),
  });
};

export const createdResponse = (
  res: Response,
  data: any = null,
  message = 'Resource created successfully'
) => {
  return successResponse(res, data, message, 201);
};

export const errorResponse = (
  res: Response,
  message = 'An error occurred',
  statusCode = 500,
  errors: any = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};

export const paginatedResponse = (
  res: Response,
  items: any[],
  total: number,
  page: number,
  limit: number,
  message = 'Success'
) => {
  const totalPages = Math.ceil(total / limit);
  return res.status(200).json({
    success: true,
    message,
    data: items,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
};
