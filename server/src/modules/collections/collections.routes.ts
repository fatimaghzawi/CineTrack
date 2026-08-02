import type { FastifyPluginAsync } from 'fastify';

import { authenticate } from '@common/middleware';

import { createCollectionsController } from './collections.controller';
import { collectionsRepository } from './collections.repository';
import { createCollectionsService } from './collections.service';

const collectionItemSchema = {
  type: 'object',
  required: ['tmdbId', 'mediaType', 'note', 'addedAt'],
  properties: {
    tmdbId: { type: 'integer' },
    mediaType: { type: 'string', enum: ['movie', 'tv'] },
    note: { type: 'string' },
    addedAt: { type: 'string', format: 'date-time' },
  },
} as const;

const collectionSchema = {
  type: 'object',
  required: [
    'id',
    'userId',
    'name',
    'description',
    'isPublic',
    'coverTmdbId',
    'coverMediaType',
    'items',
    'createdAt',
    'updatedAt',
  ],
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    isPublic: { type: 'boolean' },
    coverTmdbId: { type: ['integer', 'null'] },
    coverMediaType: { type: ['string', 'null'], enum: ['movie', 'tv', null] },
    items: { type: 'array', items: collectionItemSchema },
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

const collectionsRoutes: FastifyPluginAsync = async (fastify) => {
  const service = createCollectionsService(collectionsRepository);
  const controller = createCollectionsController(service);

  fastify.post(
    '/collections',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Collections'],
        summary: 'Create a collection',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 100 },
            description: { type: 'string', maxLength: 1000 },
            isPublic: { type: 'boolean' },
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
                required: ['collection'],
                properties: { collection: collectionSchema },
              },
            },
          },
        },
      },
    },
    async (request, reply) => controller.create(request, reply),
  );

  fastify.get(
    '/collections',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Collections'],
        summary: 'List collections',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100 },
            isPublic: { type: 'boolean' },
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
                  items: { type: 'array', items: collectionSchema },
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
    '/collections/:id',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Collections'],
        summary: 'Get a collection by id',
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
                required: ['collection'],
                properties: { collection: collectionSchema },
              },
            },
          },
        },
      },
    },
    async (request, reply) => controller.getById(request, reply),
  );

  fastify.patch(
    '/collections/:id',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Collections'],
        summary: 'Update a collection',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'string' } },
        },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 100 },
            description: { type: 'string', maxLength: 1000 },
            isPublic: { type: 'boolean' },
            coverTmdbId: { type: ['integer', 'null'], minimum: 1 },
            coverMediaType: { type: ['string', 'null'], enum: ['movie', 'tv', null] },
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
                required: ['collection'],
                properties: { collection: collectionSchema },
              },
            },
          },
        },
      },
    },
    async (request, reply) => controller.update(request, reply),
  );

  fastify.delete(
    '/collections/:id',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Collections'],
        summary: 'Delete a collection',
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

  fastify.post(
    '/collections/:id/items',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Collections'],
        summary: 'Add a title to a collection',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'string' } },
        },
        body: {
          type: 'object',
          required: ['tmdbId', 'mediaType'],
          properties: {
            tmdbId: { type: 'integer', minimum: 1 },
            mediaType: { type: 'string', enum: ['movie', 'tv'] },
            note: { type: 'string', maxLength: 300 },
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
                required: ['collection'],
                properties: { collection: collectionSchema },
              },
            },
          },
        },
      },
    },
    async (request, reply) => controller.addItem(request, reply),
  );

  fastify.delete(
    '/collections/:id/items',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Collections'],
        summary: 'Remove a title from a collection',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'string' } },
        },
        body: {
          type: 'object',
          required: ['tmdbId', 'mediaType'],
          properties: {
            tmdbId: { type: 'integer', minimum: 1 },
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
                required: ['collection'],
                properties: { collection: collectionSchema },
              },
            },
          },
        },
      },
    },
    async (request, reply) => controller.removeItem(request, reply),
  );
};

export default collectionsRoutes;
