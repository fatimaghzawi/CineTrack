import type { FastifyReply, FastifyRequest } from 'fastify';

import { success } from '@common/utils/response';
import { parseOrThrow } from '@common/validators';

import {
  tmdbDiscoverQuerySchema,
  tmdbIdParamsSchema,
  tmdbSearchQuerySchema,
  tmdbTrendingQuerySchema,
} from './tmdb.schema';
import type { TmdbService } from './tmdb.service';

export class TmdbController {
  constructor(private readonly service: TmdbService) {}

  async search(request: FastifyRequest, _reply: FastifyReply) {
    const query = parseOrThrow(tmdbSearchQuerySchema, request.query);
    const data = await this.service.search({
      query: query.query,
      page: query.page,
      includeAdult: query.includeAdult,
    });
    return success(data);
  }

  async getMovie(request: FastifyRequest, _reply: FastifyReply) {
    const params = parseOrThrow(tmdbIdParamsSchema, request.params);
    const data = await this.service.getMovie(params.id);
    return success(data);
  }

  async getTv(request: FastifyRequest, _reply: FastifyReply) {
    const params = parseOrThrow(tmdbIdParamsSchema, request.params);
    const data = await this.service.getTv(params.id);
    return success(data);
  }

  async getTrending(request: FastifyRequest, _reply: FastifyReply) {
    const query = parseOrThrow(tmdbTrendingQuerySchema, request.query);
    const data = await this.service.getTrending({
      mediaType: query.mediaType,
      timeWindow: query.timeWindow,
      page: query.page,
    });
    return success(data);
  }

  async discoverMovies(request: FastifyRequest, _reply: FastifyReply) {
    const query = parseOrThrow(tmdbDiscoverQuerySchema, request.query);
    const data = await this.service.discoverMovies({
      page: query.page,
      sortBy: query.sortBy,
    });
    return success(data);
  }

  async discoverTv(request: FastifyRequest, _reply: FastifyReply) {
    const query = parseOrThrow(tmdbDiscoverQuerySchema, request.query);
    const data = await this.service.discoverTv({
      page: query.page,
      sortBy: query.sortBy,
    });
    return success(data);
  }
}

export const createTmdbController = (service: TmdbService): TmdbController =>
  new TmdbController(service);
