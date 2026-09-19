const config = require('../config');
const { sendError } = require('../utils/response');

/**
 * Global error handler — catches all errors passed via next(err).
 * Differentiates operational errors (AppError) from unexpected errors.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Log all errors in development
  if (config.env === 'development') {
    console.error('[ErrorHandler]', {
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
    });
  } else {
    // Only log unexpected errors in production
    if (!err.isOperational) {
      console.error('[CRITICAL] Unexpected error:', err);
    }
  }

  // Prisma known errors
  if (err.code === 'P2002') {
    // Unique constraint violation
    const field = err.meta?.target?.join(', ') || 'field';
    return sendError(res, {
      message: `A record with this ${field} already exists.`,
      statusCode: 409,
    });
  }

  if (err.code === 'P2025') {
    // Record not found
    return sendError(res, {
      message: 'The requested record was not found.',
      statusCode: 404,
    });
  }

  // JWT errors (caught upstream in middleware but just in case)
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, { message: 'Invalid token.', statusCode: 401 });
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, { message: 'Token expired.', statusCode: 401 });
  }

  // Operational AppError
  if (err.isOperational) {
    return sendError(res, {
      message: err.message,
      errors: err.errors,
      statusCode: err.statusCode,
    });
  }

  // Unhandled/unexpected errors — send generic message in production
  return sendError(res, {
    message:
      config.env === 'development'
        ? err.message
        : 'An unexpected error occurred. Please try again.',
    statusCode: 500,
  });
};

/**
 * 404 handler for unmatched routes
 */
const notFoundHandler = (req, res) => {
  return sendError(res, {
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    statusCode: 404,
  });
};

module.exports = { errorHandler, notFoundHandler };
