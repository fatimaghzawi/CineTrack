import type { FastifyPluginAsync } from 'fastify';

import { createRecommendationsController } from './recommendations.controller';
import { recommendationsRepository } from './recommendations.repository';
import { createRecommendationsService } from './recommendations.service';

/**
 * Recommendations routes — wires URL paths to controller methods.
 */
const recommendationsRoutes: FastifyPluginAsync = async (fastify) => {
  const service = createRecommendationsService(recommendationsRepository);
  const controller = createRecommendationsController(service);

  fastify.get(
    '/recommendations/health',
    {
      schema: {
        tags: ['Recommendations'],
        summary: 'Recommendations module scaffold health',
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

export default recommendationsRoutes;
