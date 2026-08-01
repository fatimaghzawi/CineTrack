import cors from '@fastify/cors';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { env } from '@config/env';

const corsPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });
};

export default fp(corsPlugin, { name: 'cors' });
