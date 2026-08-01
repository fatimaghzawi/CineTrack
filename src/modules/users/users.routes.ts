import type { FastifyPluginAsync } from 'fastify';

import { authenticate } from '@common/middleware';

import { createUsersController } from './users.controller';
import { usersRepository } from './users.repository';
import { createUsersService } from './users.service';

const userPublicSchema = {
  type: 'object',
  required: ['id', 'email', 'displayName', 'createdAt', 'updatedAt'],
  properties: {
    id: { type: 'string' },
    email: { type: 'string' },
    displayName: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
  },
} as const;

const usersRoutes: FastifyPluginAsync = async (fastify) => {
  const service = createUsersService(usersRepository);
  const controller = createUsersController(service);

  fastify.get(
    '/users/me',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Users'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            required: ['success', 'data'],
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                required: ['user'],
                properties: {
                  user: userPublicSchema,
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => controller.getMe(request, reply),
  );

  fastify.patch(
    '/users/me',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Users'],
        summary: 'Update current user profile',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            displayName: { type: 'string', minLength: 2, maxLength: 80 },
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
                required: ['user'],
                properties: {
                  user: userPublicSchema,
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => controller.updateMe(request, reply),
  );
};

export default usersRoutes;
