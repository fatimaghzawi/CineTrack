import type { FastifyPluginAsync } from 'fastify';

import { authenticate } from '@common/middleware';

import { createStatisticsController } from './statistics.controller';
import { statisticsRepository } from './statistics.repository';
import { createStatisticsService } from './statistics.service';

const statisticsSnapshotSchema = {
  type: 'object',
  required: [
    'id',
    'userId',
    'totals',
    'byMediaType',
    'ratings',
    'lastComputedAt',
    'createdAt',
    'updatedAt',
  ],
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    totals: {
      type: 'object',
      required: [
        'watchlist',
        'completed',
        'watching',
        'planToWatch',
        'dropped',
        'favorites',
        'ratings',
        'journalEntries',
        'collections',
      ],
      properties: {
        watchlist: { type: 'integer' },
        completed: { type: 'integer' },
        watching: { type: 'integer' },
        planToWatch: { type: 'integer' },
        dropped: { type: 'integer' },
        favorites: { type: 'integer' },
        ratings: { type: 'integer' },
        journalEntries: { type: 'integer' },
        collections: { type: 'integer' },
      },
    },
    byMediaType: {
      type: 'object',
      required: ['movie', 'tv'],
      properties: {
        movie: { type: 'integer' },
        tv: { type: 'integer' },
      },
    },
    ratings: {
      type: 'object',
      required: ['averageScore', 'highestScore', 'lowestScore'],
      properties: {
        averageScore: { type: ['number', 'null'] },
        highestScore: { type: ['number', 'null'] },
        lowestScore: { type: ['number', 'null'] },
      },
    },
    lastComputedAt: { type: 'string', format: 'date-time' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
} as const;

/**
 * Statistics routes — wires URL paths to controller methods.
 */
const statisticsRoutes: FastifyPluginAsync = async (fastify) => {
  const service = createStatisticsService(statisticsRepository);
  const controller = createStatisticsController(service);

  fastify.get(
    '/statistics',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Statistics'],
        summary: 'Get personal viewing statistics',
        description:
          'Returns a cached snapshot of personal totals. Pass refresh=true to recompute from source data.',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
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
                required: ['statistics'],
                properties: {
                  statistics: statisticsSnapshotSchema,
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => controller.getMine(request, reply),
  );
};

export default statisticsRoutes;
