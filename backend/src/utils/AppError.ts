export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: any;

  constructor(message: string, statusCode = 500, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg: string, errors?: any) {
    return new AppError(msg, 400, errors);
  }

  static unauthorized(msg = 'Authentication required.') {
    return new AppError(msg, 401);
  }

  static forbidden(msg = 'Access denied.') {
    return new AppError(msg, 403);
  }

  static notFound(msg = 'Resource not found.') {
    return new AppError(msg, 404);
  }

  static conflict(msg: string) {
    return new AppError(msg, 409);
  }

  static unprocessable(msg: string, errors?: any) {
    return new AppError(msg, 422, errors);
  }

  static internal(msg = 'Internal server error.') {
    return new AppError(msg, 500);
  }
}

export default AppError;
