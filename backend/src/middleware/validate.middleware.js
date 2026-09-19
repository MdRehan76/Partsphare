const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

/**
 * validate — runs after express-validator chain and returns 422 if any errors.
 * Place this after validation chains in route definitions.
 *
 * Example:
 *   router.post('/register', [...validators], validate, controller.register);
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, {
      message: 'Validation failed.',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
      statusCode: 422,
    });
  }
  next();
};

module.exports = validate;
