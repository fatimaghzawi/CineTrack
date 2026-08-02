import type { FastifyPluginAsync } from 'fastify';

import { authenticate } from '@common/middleware';

import { createWatchlistController } from './watchlist.controller';
import { watchlistRepository } from './watchlist.repository';
import { createWatchlistService } from './watchlist.service';

const watchlistItemSchema = {
  type: 'object',
  required: [
    'id',
    'userId',
    'tmdbId',
    'mediaType',
    'status',
    'progress',
    'notes',
    'completedAt',
    'createdAt',
    'updatedAt',
  ],
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    tmdbId: { type: 'integer' },
    mediaType: { type: 'string', enum: ['movie', 'tv'] },
    status: {
      type: 'string',
      enum: ['plan_to_watch', 'watching', 'completed', 'dropped'],
    },
    progress: {
      type: 'object',
      properties: {
        season: { type: 'integer' },
        episode: { type: 'integer' },
        percent: { type: 'number' },
      },
    },
    notes: { type: 'string' },
    completedAt: { type: ['string', 'null'], format: 'date-time' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
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

const watchlistRoutes: FastifyPluginAsync = async (fastify) => {
  const service = createWatchlistService(watchlistRepository);
  const controller = createWatchlistController(service);

  fastify.post(
    '/watchlist',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Watchlist'],
        summary: 'Add a title to the watchlist',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['tmdbId', 'mediaType'],
          properties: {
            tmdbId: { type: 'integer', minimum: 1 },
            mediaType: { type: 'string', enum: ['movie', 'tv'] },
            status: {
              type: 'string',
              enum: ['plan_to_watch', 'watching', 'completed', 'dropped'],
            },
            progress: {
              type: 'object',
              properties: {
                season: { type: 'integer', minimum: 0 },
                episode: { type: 'integer', minimum: 0 },
                percent: { type: 'number', minimum: 0, maximum: 100 },
              },
            },
            notes: { type: 'string', maxLength: 500 },
          },
        },
        response: {
          201: {
            type: 'object',
            required: ['success', 'data'],
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                required: ['item'],
                properties: { item: watchlistItemSchema },
              },
            },
          },
        },
      },
    },
    async (request, reply) => controller.create(request, reply),
  );

  fastify.get(
    '/watchlist',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Watchlist'],
        summary: 'List watchlist items',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100 },
            status: {
              type: 'string',
              enum: ['plan_to_watch', 'watching', 'completed', 'dropped'],
            },
            mediaType: { type: 'string', enum: ['movie', 'tv'] },
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
                required: ['items', 'pagination'],
                properties: {
                  items: { type: 'array', items: watchlistItemSchema },
                  pagination: paginationSchema,
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => controller.list(request, reply),
  );

  fastify.get(
    '/watchlist/:id',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Watchlist'],
        summary: 'Get a watchlist item by id',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'string' } },
        },
        response: {
          200: {
            type: 'object',
            required: ['success', 'data'],
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                required: ['item'],
                properties: { item: watchlistItemSchema },
              },
            },
          },
        },
      },
    },
    async (request, reply) => controller.getById(request, reply),
  );

  fastify.patch(
    '/watchlist/:id',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Watchlist'],
        summary: 'Update a watchlist item',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'string' } },
        },
        body: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['plan_to_watch', 'watching', 'completed', 'dropped'],
            },
            progress: {
              type: 'object',
              properties: {
                season: { type: 'integer', minimum: 0 },
                episode: { type: 'integer', minimum: 0 },
                percent: { type: 'number', minimum: 0, maximum: 100 },
              },
            },
            notes: { type: 'string', maxLength: 500 },
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
                required: ['item'],
                properties: { item: watchlistItemSchema },
              },
            },
          },
        },
      },
    },
    async (request, reply) => controller.update(request, reply),
  );

  fastify.delete(
    '/watchlist/:id',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Watchlist'],
        summary: 'Remove a watchlist item',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'string' } },
        },
        response: {
          200: {
            type: 'object',
            required: ['success', 'data'],
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                required: ['message'],
                properties: { message: { type: 'string' } },
              },
            },
          },
        },
      },
    },
    async (request, reply) => controller.remove(request, reply),
  );
};

export default watchlistRoutes;
