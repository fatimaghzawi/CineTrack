import type { FastifyPluginAsync } from 'fastify';

import { authenticate } from '@common/middleware';

import { createJournalController } from './journal.controller';
import { journalRepository } from './journal.repository';
import { createJournalService } from './journal.service';

const journalEntrySchema = {
  type: 'object',
  required: [
    'id',
    'userId',
    'tmdbId',
    'mediaType',
    'title',
    'body',
    'watchedAt',
    'mood',
    'isSpoiler',
    'createdAt',
    'updatedAt',
  ],
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    tmdbId: { type: 'integer' },
    mediaType: { type: 'string', enum: ['movie', 'tv'] },
    title: { type: 'string' },
    body: { type: 'string' },
    watchedAt: { type: ['string', 'null'], format: 'date-time' },
    mood: { type: 'string' },
    isSpoiler: { type: 'boolean' },
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

/**
 * Journal routes — wires URL paths to controller methods.
 */
const journalRoutes: FastifyPluginAsync = async (fastify) => {
  const service = createJournalService(journalRepository);
  const controller = createJournalController(service);

  fastify.post(
    '/journal',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Journal'],
        summary: 'Create a journal entry',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['tmdbId', 'mediaType', 'body'],
          properties: {
            tmdbId: { type: 'integer', minimum: 1 },
            mediaType: { type: 'string', enum: ['movie', 'tv'] },
            title: { type: 'string', maxLength: 160 },
            body: { type: 'string', minLength: 1, maxLength: 10_000 },
            watchedAt: { type: 'string', format: 'date-time' },
            mood: { type: 'string', maxLength: 40 },
            isSpoiler: { type: 'boolean' },
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
                required: ['entry'],
                properties: {
                  entry: journalEntrySchema,
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => controller.create(request, reply),
  );

  fastify.get(
    '/journal',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Journal'],
        summary: 'List journal entries',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100 },
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
                required: ['items', 'pagination'],
                properties: {
                  items: { type: 'array', items: journalEntrySchema },
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
    '/journal/:id',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Journal'],
        summary: 'Get a journal entry by id',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
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
                required: ['entry'],
                properties: {
                  entry: journalEntrySchema,
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => controller.getById(request, reply),
  );

  fastify.patch(
    '/journal/:id',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Journal'],
        summary: 'Update a journal entry',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          properties: {
            title: { type: 'string', maxLength: 160 },
            body: { type: 'string', minLength: 1, maxLength: 10_000 },
            watchedAt: { type: ['string', 'null'], format: 'date-time' },
            mood: { type: 'string', maxLength: 40 },
            isSpoiler: { type: 'boolean' },
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
                required: ['entry'],
                properties: {
                  entry: journalEntrySchema,
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => controller.update(request, reply),
  );

  fastify.delete(
    '/journal/:id',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Journal'],
        summary: 'Delete a journal entry',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
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
                properties: {
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => controller.remove(request, reply),
  );
};

export default journalRoutes;
