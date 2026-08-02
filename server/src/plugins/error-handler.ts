import type { FastifyError, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { ErrorCode, isAppError, NotFoundError } from '@common/errors';
import { failure } from '@common/utils/response';

/**
 * Global error + 404 handlers using shared AppError + response helpers.
 */
const errorHandlerPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.setErrorHandler((error: FastifyError, request, reply) => {
    if (isAppError(error)) {
      if (error.statusCode >= 500) {
        request.log.error({ err: error }, error.message);
      } else {
        request.log.warn({ err: error }, error.message);
      }

      return reply
        .status(error.statusCode)
        .send(failure(error.message, error.code, error.statusCode, error.details));
    }

    if (error.validation) {
      request.log.warn({ err: error }, 'Request validation failed');
      return reply
        .status(422)
        .send(
          failure('Request validation failed', ErrorCode.VALIDATION_ERROR, 422, error.validation),
        );
    }

    const statusCode = error.statusCode ?? 500;

    if (statusCode === 429) {
      request.log.warn({ err: error }, 'Rate limit exceeded');
      return reply
        .status(429)
        .send(failure(error.message || 'Too many requests', ErrorCode.TOO_MANY_REQUESTS, 429));
    }

    const isServerError = statusCode >= 500;

    if (isServerError) {
      request.log.error({ err: error }, 'Unhandled server error');
    } else {
      request.log.warn({ err: error }, 'Request error');
    }

    return reply
      .status(statusCode)
      .send(
        failure(
          isServerError ? 'Internal server error' : (error.message ?? 'Unexpected error'),
          error.code ?? (isServerError ? ErrorCode.INTERNAL_SERVER_ERROR : ErrorCode.BAD_REQUEST),
          statusCode,
        ),
      );
  });

  fastify.setNotFoundHandler((request, reply) => {
    const error = new NotFoundError(`Route ${request.method}:${request.url} not found`);

    return reply
      .status(error.statusCode)
      .send(failure(error.message, error.code, error.statusCode));
  });
};

export default fp(errorHandlerPlugin, { name: 'error-handler' });
