import type { FastifyPluginAsync } from 'fastify';

import { createCollectionsController } from './collections.controller';
import { collectionsRepository } from './collections.repository';
import { createCollectionsService } from './collections.service';

/**
 * Collections routes — wires URL paths to controller methods.
 */
const collectionsRoutes: FastifyPluginAsync = async (fastify) => {
  const service = createCollectionsService(collectionsRepository);
  const controller = createCollectionsController(service);

  fastify.get(
    '/collections/health',
    {
      schema: {
        tags: ['Collections'],
        summary: 'Collections module scaffold health',
        response: {
          200: {
            type: 'object',
            required: ['success', 'data'],
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                required: ['module', 'status', 'persistence'],
                properties: {
                  module: { type: 'string' },
                  status: { type: 'string' },
                  persistence: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => controller.readiness(request, reply),
  );
};

export default collectionsRoutes;
