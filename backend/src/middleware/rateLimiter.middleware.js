const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/response');

const rateLimitResponse = (req, res) => {
  return sendError(res, {
    message: 'Too many requests. Please try again later.',
    statusCode: 429,
  });
};

/**
 * General API rate limiter — 100 requests per 15 minutes per IP
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

/**
 * Auth-specific rate limiter — 10 requests per 15 minutes per IP
 * Applied to login and register to prevent brute force
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

/**
 * Strict limiter for sensitive ops — 5 per hour
 */
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

module.exports = { generalLimiter, authLimiter, strictLimiter };
