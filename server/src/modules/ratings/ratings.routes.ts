import type { FastifyPluginAsync } from 'fastify';

import { createRatingsController } from './ratings.controller';
import { ratingsRepository } from './ratings.repository';
import { createRatingsService } from './ratings.service';

/**
 * Ratings routes — wires URL paths to controller methods.
 */
const ratingsRoutes: FastifyPluginAsync = async (fastify) => {
  const service = createRatingsService(ratingsRepository);
  const controller = createRatingsController(service);

  fastify.get(
    '/ratings/health',
    {
      schema: {
        tags: ['Ratings'],
        summary: 'Ratings module scaffold health',
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

export default ratingsRoutes;
