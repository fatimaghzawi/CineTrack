import type { FastifyReply, FastifyRequest } from 'fastify';

import { HttpStatus } from '@common/constants/http';
import { getAuthUser } from '@common/middleware';
import { success } from '@common/utils/response';
import { parseOrThrow } from '@common/validators';

import {
  createFavoriteSchema,
  favoriteIdParamsSchema,
  favoriteRefParamsSchema,
  listFavoritesQuerySchema,
} from './favorites.schema';
import type { FavoritesService } from './favorites.service';

export class FavoritesController {
  constructor(private readonly service: FavoritesService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const auth = getAuthUser(request);
    const body = parseOrThrow(createFavoriteSchema, request.body);
    const favorite = await this.service.create(auth.sub, body);
    return reply.status(HttpStatus.CREATED).send(success({ favorite }));
  }

  async list(request: FastifyRequest, _reply: FastifyReply) {
    const auth = getAuthUser(request);
    const query = parseOrThrow(listFavoritesQuerySchema, request.query);
    const result = await this.service.list(
      auth.sub,
      { mediaType: query.mediaType },
      query.page,
      query.limit,
    );
    return success(result);
  }

  async removeById(request: FastifyRequest, _reply: FastifyReply) {
    const auth = getAuthUser(request);
    const params = parseOrThrow(favoriteIdParamsSchema, request.params);
    await this.service.removeById(auth.sub, params.id);
    return success({ message: 'Favorite deleted' });
  }

  async removeByRef(request: FastifyRequest, _reply: FastifyReply) {
    const auth = getAuthUser(request);
    const params = parseOrThrow(favoriteRefParamsSchema, request.params);
    await this.service.removeByRef(auth.sub, params.tmdbId, params.mediaType);
    return success({ message: 'Favorite deleted' });
  }
}

export const createFavoritesController = (service: FavoritesService): FavoritesController =>
  new FavoritesController(service);
