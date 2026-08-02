import type { FastifyPluginAsync } from 'fastify';

import { createWatchlistController } from './watchlist.controller';
import { watchlistRepository } from './watchlist.repository';
import { createWatchlistService } from './watchlist.service';

/**
 * Watchlist routes — wires URL paths to controller methods.
 */
const watchlistRoutes: FastifyPluginAsync = async (fastify) => {
  const service = createWatchlistService(watchlistRepository);
  const controller = createWatchlistController(service);

  fastify.get(
    '/watchlist/health',
    {
      schema: {
        tags: ['Watchlist'],
        summary: 'Watchlist module scaffold health',
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

export default watchlistRoutes;
