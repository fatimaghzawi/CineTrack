import type { FastifyPluginAsync } from 'fastify';

import { createTmdbController } from './tmdb.controller';
import { tmdbRepository } from './tmdb.repository';
import { createTmdbService } from './tmdb.service';

const tmdbPayloadResponse = {
  type: 'object',
  required: ['success', 'data'],
  properties: {
    success: { type: 'boolean' },
    data: {},
  },
} as const;

const tmdbRoutes: FastifyPluginAsync = async (fastify) => {
  const service = createTmdbService(tmdbRepository);
  const controller = createTmdbController(service);

  fastify.get(
    '/tmdb/search',
    {
      schema: {
        tags: ['TMDb'],
        summary: 'Search movies and TV shows',
        querystring: {
          type: 'object',
          required: ['query'],
          properties: {
            query: { type: 'string' },
            page: { type: 'integer', minimum: 1 },
            includeAdult: { type: 'boolean' },
          },
        },
        response: { 200: tmdbPayloadResponse },
      },
    },
    async (request, reply) => controller.search(request, reply),
  );

  fastify.get(
    '/tmdb/movie/:id',
    {
      schema: {
        tags: ['TMDb'],
        summary: 'Get movie details by TMDb id',
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        response: { 200: tmdbPayloadResponse },
      },
    },
    async (request, reply) => controller.getMovie(request, reply),
  );

  fastify.get(
    '/tmdb/tv/:id',
    {
      schema: {
        tags: ['TMDb'],
        summary: 'Get TV show details by TMDb id',
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        response: { 200: tmdbPayloadResponse },
      },
    },
    async (request, reply) => controller.getTv(request, reply),
  );

  fastify.get(
    '/tmdb/trending',
    {
      schema: {
        tags: ['TMDb'],
        summary: 'Get trending titles',
        querystring: {
          type: 'object',
          properties: {
            mediaType: { type: 'string', enum: ['all', 'movie', 'tv'] },
            timeWindow: { type: 'string', enum: ['day', 'week'] },
            page: { type: 'integer', minimum: 1 },
          },
        },
        response: { 200: tmdbPayloadResponse },
      },
    },
    async (request, reply) => controller.getTrending(request, reply),
  );

  fastify.get(
    '/tmdb/discover/movie',
    {
      schema: {
        tags: ['TMDb'],
        summary: 'Discover movies',
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1 },
            sortBy: { type: 'string' },
            withGenres: { type: 'string' },
          },
        },
        response: { 200: tmdbPayloadResponse },
      },
    },
    async (request, reply) => controller.discoverMovies(request, reply),
  );

  fastify.get(
    '/tmdb/discover/tv',
    {
      schema: {
        tags: ['TMDb'],
        summary: 'Discover TV shows',
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1 },
            sortBy: { type: 'string' },
            withGenres: { type: 'string' },
          },
        },
        response: { 200: tmdbPayloadResponse },
      },
    },
    async (request, reply) => controller.discoverTv(request, reply),
  );
};

export default tmdbRoutes;
