import type { FastifyPluginAsync } from 'fastify';

import { createFavoritesController } from './favorites.controller';
import { favoritesRepository } from './favorites.repository';
import { createFavoritesService } from './favorites.service';

/**
 * Favorites routes — wires URL paths to controller methods.
 */
const favoritesRoutes: FastifyPluginAsync = async (fastify) => {
  const service = createFavoritesService(favoritesRepository);
  const controller = createFavoritesController(service);

  fastify.get(
    '/favorites/health',
    {
      schema: {
        tags: ['Favorites'],
        summary: 'Favorites module scaffold health',
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

export default favoritesRoutes;
