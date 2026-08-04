import type { FastifyPluginAsync } from 'fastify';

import { authenticate } from '@common/middleware';

import { createRecommendationsController } from './recommendations.controller';
import { recommendationsRepository } from './recommendations.repository';
import { createRecommendationsService } from './recommendations.service';

const recommendationItemSchema = {
  type: 'object',
  required: ['tmdbId', 'mediaType', 'score', 'reason'],
  properties: {
    tmdbId: { type: 'integer' },
    mediaType: { type: 'string', enum: ['movie', 'tv'] },
    score: { type: ['number', 'null'] },
    reason: { type: 'string' },
  },
} as const;

const paginationSchema = {
  type: 'object',
  required: ['page', 'limit', 'total', 'totalPages', 'hasNextPage', 'hasPrevPage'],
  properties: {
    page: { type: 'integer' },
    limit: { type: 'integer' },
    total: { type: 'integer' },
    totalPages: { type: 'integer' },
    hasNextPage: { type: 'boolean' },
    hasPrevPage: { type: 'boolean' },
  },
} as const;

const recommendationsRoutes: FastifyPluginAsync = async (fastify) => {
  const service = createRecommendationsService(recommendationsRepository);
  const controller = createRecommendationsController(service);

  fastify.get(
    '/recommendations',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Recommendations'],
        summary: 'Get personalized title recommendations',
        description:
          'Returns a cached hybrid recommendation list. Pass refresh=true to regenerate from TMDb trending and your taste signals.',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100 },
            mediaType: { type: 'string', enum: ['movie', 'tv'] },
            refresh: { type: 'boolean' },
          },
        },
        response: {
          200: {
            type: 'object',
            required: ['success', 'data'],
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                required: ['items', 'pagination', 'source', 'generatedAt', 'expiresAt'],
                properties: {
                  items: { type: 'array', items: recommendationItemSchema },
                  pagination: paginationSchema,
                  source: { type: 'string', enum: ['tmdb', 'hybrid'] },
                  generatedAt: { type: 'string', format: 'date-time' },
                  expiresAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => controller.list(request, reply),
  );
};

export default recommendationsRoutes;
