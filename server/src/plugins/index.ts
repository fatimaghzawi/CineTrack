import type { FastifyInstance } from 'fastify';

import compressPlugin from './compress';
import cookiePlugin from './cookie';
import corsPlugin from './cors';
import errorHandlerPlugin from './error-handler';
import helmetPlugin from './helmet';
import jwtPlugin from './jwt';
import rateLimitPlugin from './rate-limit';
import swaggerPlugin from './swagger';

/**
 * Registers infrastructure plugins in a deliberate order.
 * Feature modules register their own routes later via the app factory.
 */
export async function registerPlugins(app: FastifyInstance): Promise<void> {
  await app.register(errorHandlerPlugin);
  await app.register(corsPlugin);
  await app.register(helmetPlugin);
  await app.register(compressPlugin);
  await app.register(rateLimitPlugin);
  await app.register(cookiePlugin);
  await app.register(jwtPlugin);
  await app.register(swaggerPlugin);
}
