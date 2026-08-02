import compress from '@fastify/compress';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

/**
 * Compress JSON (and other) responses — smaller payloads for list endpoints.
 */
const compressPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(compress, {
    global: true,
    encodings: ['gzip', 'deflate', 'br'],
    threshold: 1024,
  });
};

export default fp(compressPlugin, { name: 'compress' });
