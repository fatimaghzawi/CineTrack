import type { FastifyPluginAsync } from 'fastify';

import { authenticate } from '@common/middleware';

import { createFavoritesController } from './favorites.controller';
import { favoritesRepository } from './favorites.repository';
import { createFavoritesService } from './favorites.service';

const favoriteSchema = {
  type: 'object',
  required: ['id', 'userId', 'tmdbId', 'mediaType', 'createdAt', 'updatedAt'],
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    tmdbId: { type: 'integer' },
    mediaType: { type: 'string', enum: ['movie', 'tv'] },
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

const favoritesRoutes: FastifyPluginAsync = async (fastify) => {
  const service = createFavoritesService(favoritesRepository);
  const controller = createFavoritesController(service);

  fastify.post(
    '/favorites',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Favorites'],
        summary: 'Add a favorite title',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['tmdbId', 'mediaType'],
          properties: {
            tmdbId: { type: 'integer', minimum: 1 },
            mediaType: { type: 'string', enum: ['movie', 'tv'] },
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
                required: ['favorite'],
                properties: { favorite: favoriteSchema },
              },
            },
          },
        },
      },
    },
    async (request, reply) => controller.create(request, reply),
  );

  fastify.get(
    '/favorites',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Favorites'],
        summary: 'List favorite titles',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100 },
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
                  items: { type: 'array', items: favoriteSchema },
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

  fastify.delete(
    '/favorites/title/:mediaType/:tmdbId',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Favorites'],
        summary: 'Remove a favorite by TMDb reference',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['mediaType', 'tmdbId'],
          properties: {
            mediaType: { type: 'string', enum: ['movie', 'tv'] },
            tmdbId: { type: 'integer', minimum: 1 },
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
                required: ['message'],
                properties: { message: { type: 'string' } },
              },
            },
          },
        },
      },
    },
    async (request, reply) => controller.removeByRef(request, reply),
  );

  fastify.delete(
    '/favorites/:id',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Favorites'],
        summary: 'Remove a favorite by id',
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
    async (request, reply) => controller.removeById(request, reply),
  );
};

export default favoritesRoutes;
