import type { FastifyPluginAsync } from 'fastify';

import { usersRepository } from '@modules/users';

import { createAuthController } from './auth.controller';
import { createAuthService } from './auth.service';

const authUserSchema = {
  type: 'object',
  required: ['id', 'email', 'displayName'],
  properties: {
    id: { type: 'string' },
    email: { type: 'string' },
    displayName: { type: 'string' },
  },
} as const;

const authSuccessSchema = {
  type: 'object',
  required: ['success', 'data'],
  properties: {
    success: { type: 'boolean' },
    data: {
      type: 'object',
      required: ['user', 'accessToken'],
      properties: {
        user: authUserSchema,
        accessToken: { type: 'string' },
      },
    },
  },
} as const;

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const service = createAuthService(usersRepository);
  const controller = createAuthController(service);

  fastify.post(
    '/auth/register',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Register a new user',
        body: {
          type: 'object',
          required: ['email', 'password', 'displayName'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            displayName: { type: 'string', minLength: 2, maxLength: 80 },
          },
        },
        response: {
          201: authSuccessSchema,
        },
      },
    },
    async (request, reply) => controller.register(request, reply),
  );

  fastify.post(
    '/auth/login',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Login with email and password',
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        response: {
          200: authSuccessSchema,
        },
      },
    },
    async (request, reply) => controller.login(request, reply),
  );

  fastify.post(
    '/auth/logout',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Clear access token cookie',
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
    async (request, reply) => controller.logout(request, reply),
  );
};

export default authRoutes;
