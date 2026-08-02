import helmet from '@fastify/helmet';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { env } from '@config/env';

const helmetPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(helmet, {
    // Relax CSP in development so Swagger UI assets load cleanly.
    contentSecurityPolicy: env.isDevelopment ? false : undefined,
    global: true,
  });
};

export default fp(helmetPlugin, { name: 'helmet' });
