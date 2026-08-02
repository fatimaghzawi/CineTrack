import cookie from '@fastify/cookie';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

const cookiePlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(cookie, {
    // Signing secret can be added later when refresh-token cookies are introduced.
    hook: 'onRequest',
  });
};

export default fp(cookiePlugin, { name: 'cookie' });
