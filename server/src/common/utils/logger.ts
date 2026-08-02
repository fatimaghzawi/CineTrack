import type { FastifyBaseLogger } from 'fastify';

import { env } from '@config/env';

/**
 * Builds Fastify/pino logger options from environment.
 * Request-scoped logging still comes from Fastify's `request.log`.
 */
export function buildLoggerConfig() {
  if (env.isProduction) {
    return {
      level: 'info' as const,
    };
  }

  return {
    level: 'debug' as const,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  };
}

export type AppLogger = FastifyBaseLogger;
