/**
 * Standard API response helpers.
 * All responses follow the shape:
 * { success, message, data?, errors?, meta? }
 */

/**
 * Send a successful response
 */
const sendSuccess = (res, { message = 'Success', data = null, meta = null, statusCode = 200 } = {}) => {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  if (meta !== null) body.meta = meta;
  return res.status(statusCode).json(body);
};

/**
 * Send an error response
 */
const sendError = (res, { message = 'An error occurred', errors = null, statusCode = 500 } = {}) => {
  const body = { success: false, message };
  if (errors !== null) body.errors = errors;
  return res.status(statusCode).json(body);
};

/**
 * Send a created response (201)
 */
const sendCreated = (res, { message = 'Created successfully', data = null } = {}) => {
  return sendSuccess(res, { message, data, statusCode: 201 });
};

module.exports = { sendSuccess, sendError, sendCreated };
