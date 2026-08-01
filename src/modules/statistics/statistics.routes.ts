import type { FastifyPluginAsync } from 'fastify';

import { createStatisticsController } from './statistics.controller';
import { statisticsRepository } from './statistics.repository';
import { createStatisticsService } from './statistics.service';

/**
 * Statistics routes — wires URL paths to controller methods.
 */
const statisticsRoutes: FastifyPluginAsync = async (fastify) => {
  const service = createStatisticsService(statisticsRepository);
  const controller = createStatisticsController(service);

  fastify.get(
    '/statistics/health',
    {
      schema: {
        tags: ['Statistics'],
        summary: 'Statistics module scaffold health',
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

export default statisticsRoutes;
