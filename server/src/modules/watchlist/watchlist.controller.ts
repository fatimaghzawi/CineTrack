import type { FastifyReply, FastifyRequest } from 'fastify';

import { HttpStatus } from '@common/constants/http';
import { getAuthUser } from '@common/middleware';
import { success } from '@common/utils/response';
import { parseOrThrow } from '@common/validators';

import {
  createWatchlistItemSchema,
  listWatchlistQuerySchema,
  updateWatchlistItemSchema,
  watchlistIdParamsSchema,
} from './watchlist.schema';
import type { WatchlistService } from './watchlist.service';

/**
 * Watchlist controller — thin HTTP adapters.
 */
export class WatchlistController {
  constructor(private readonly service: WatchlistService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const auth = getAuthUser(request);
    const body = parseOrThrow(createWatchlistItemSchema, request.body);
    const item = await this.service.create(auth.sub, body);
    return reply.status(HttpStatus.CREATED).send(success({ item }));
  }

  async list(request: FastifyRequest, _reply: FastifyReply) {
    const auth = getAuthUser(request);
    const query = parseOrThrow(listWatchlistQuerySchema, request.query);
    const { page, limit, status, mediaType } = query;
    const result = await this.service.list(auth.sub, { status, mediaType }, page, limit);
    return success(result);
  }

  async getById(request: FastifyRequest, _reply: FastifyReply) {
    const auth = getAuthUser(request);
    const params = parseOrThrow(watchlistIdParamsSchema, request.params);
    const item = await this.service.getById(auth.sub, params.id);
    return success({ item });
  }

  async update(request: FastifyRequest, _reply: FastifyReply) {
    const auth = getAuthUser(request);
    const params = parseOrThrow(watchlistIdParamsSchema, request.params);
    const body = parseOrThrow(updateWatchlistItemSchema, request.body);
    const item = await this.service.update(auth.sub, params.id, body);
    return success({ item });
  }

  async remove(request: FastifyRequest, _reply: FastifyReply) {
    const auth = getAuthUser(request);
    const params = parseOrThrow(watchlistIdParamsSchema, request.params);
    await this.service.remove(auth.sub, params.id);
    return success({ message: 'Watchlist item deleted' });
  }
}

export const createWatchlistController = (service: WatchlistService): WatchlistController =>
  new WatchlistController(service);
