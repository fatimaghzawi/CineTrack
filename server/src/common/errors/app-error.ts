import { ErrorCode } from './error-codes';

export type AppErrorOptions = {
  code?: ErrorCode | string;
  details?: unknown;
  cause?: unknown;
  isOperational?: boolean;
};

/**
 * Base operational error for expected, handleable failures.
 * Unexpected bugs should remain generic Error instances (mapped to 500).
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;
  readonly isOperational: boolean;

  constructor(message: string, statusCode: number, options: AppErrorOptions = {}) {
    super(message, options.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = options.code ?? ErrorCode.BAD_REQUEST;
    this.details = options.details;
    this.isOperational = options.isOperational ?? true;

    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', options: AppErrorOptions = {}) {
    super(message, 400, { code: ErrorCode.BAD_REQUEST, ...options });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', options: AppErrorOptions = {}) {
    super(message, 401, { code: ErrorCode.UNAUTHORIZED, ...options });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', options: AppErrorOptions = {}) {
    super(message, 403, { code: ErrorCode.FORBIDDEN, ...options });
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', options: AppErrorOptions = {}) {
    super(message, 404, { code: ErrorCode.NOT_FOUND, ...options });
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', options: AppErrorOptions = {}) {
    super(message, 409, { code: ErrorCode.CONFLICT, ...options });
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', options: AppErrorOptions = {}) {
    super(message, 422, { code: ErrorCode.VALIDATION_ERROR, ...options });
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error', options: AppErrorOptions = {}) {
    super(message, 500, {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      isOperational: false,
      ...options,
    });
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
