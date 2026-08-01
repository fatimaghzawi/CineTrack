import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

const swaggerPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'CineTrack API',
        description: 'Personal Movie & TV Watchlist API',
        version: '1.0.0',
      },
      tags: [
        { name: 'Health', description: 'Service health checks' },
        { name: 'Auth', description: 'Authentication and session management' },
        { name: 'Users', description: 'User profile and account' },
        { name: 'TMDb', description: 'TMDb discovery and search' },
        { name: 'Watchlist', description: 'Personal watchlist and progress' },
        { name: 'Favorites', description: 'User favorite titles' },
        { name: 'Ratings', description: 'User ratings for titles' },
        { name: 'Journal', description: 'Personal journal entries' },
        { name: 'Collections', description: 'Custom user collections' },
        { name: 'Statistics', description: 'Personal viewing statistics' },
        { name: 'Recommendations', description: 'Personalized recommendations' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });
};

export default fp(swaggerPlugin, { name: 'swagger' });
