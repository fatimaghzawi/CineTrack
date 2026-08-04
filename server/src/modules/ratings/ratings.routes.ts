import type { FastifyPluginAsync } from 'fastify';

import { authenticate } from '@common/middleware';

import { createRatingsController } from './ratings.controller';
import { ratingsRepository } from './ratings.repository';
import { createRatingsService } from './ratings.service';

const ratingSchema = {
  type: 'object',
  required: ['id', 'userId', 'tmdbId', 'mediaType', 'score', 'review', 'createdAt', 'updatedAt'],
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    tmdbId: { type: 'integer' },
    mediaType: { type: 'string', enum: ['movie', 'tv'] },
    score: { type: 'number' },
    review: { type: 'string' },
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

const ratingsRoutes: FastifyPluginAsync = async (fastify) => {
  const service = createRatingsService(ratingsRepository);
  const controller = createRatingsController(service);

  fastify.post(
    '/ratings',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Ratings'],
        summary: 'Rate a title',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['tmdbId', 'mediaType', 'score'],
          properties: {
            tmdbId: { type: 'integer', minimum: 1 },
            mediaType: { type: 'string', enum: ['movie', 'tv'] },
            score: { type: 'number', minimum: 0.5, maximum: 10 },
            review: { type: 'string', maxLength: 2000 },
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
                required: ['rating'],
                properties: { rating: ratingSchema },
              },
            },
          },
        },
      },
    },
    async (request, reply) => controller.create(request, reply),
  );

  fastify.get(
    '/ratings',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Ratings'],
        summary: 'List ratings',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100 },
            mediaType: { type: 'string', enum: ['movie', 'tv'] },
            minScore: { type: 'number', minimum: 0.5, maximum: 10 },
            maxScore: { type: 'number', minimum: 0.5, maximum: 10 },
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
                  items: { type: 'array', items: ratingSchema },
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
    '/ratings/:id',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Ratings'],
        summary: 'Get a rating by id',
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
                required: ['rating'],
                properties: { rating: ratingSchema },
              },
            },
          },
        },
      },
    },
    async (request, reply) => controller.getById(request, reply),
  );

  fastify.patch(
    '/ratings/:id',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Ratings'],
        summary: 'Update a rating',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'string' } },
        },
        body: {
          type: 'object',
          properties: {
            score: { type: 'number', minimum: 0.5, maximum: 10 },
            review: { type: 'string', maxLength: 2000 },
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
                required: ['rating'],
                properties: { rating: ratingSchema },
              },
            },
          },
        },
      },
    },
    async (request, reply) => controller.update(request, reply),
  );

  fastify.delete(
    '/ratings/:id',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Ratings'],
        summary: 'Delete a rating',
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

export default ratingsRoutes;
