import type { FastifyReply, FastifyRequest } from 'fastify';

import { success } from '@common/utils/response';

import type { FavoritesService } from './favorites.service';

/**
 * Favorites controller — thin HTTP adapters.
 * Parse/validate input, call the service, return response helpers.
 * No business rules and no direct database/API calls.
 */

export class FavoritesController {
  constructor(private readonly service: FavoritesService) {}

  async readiness(_request: FastifyRequest, _reply: FastifyReply) {
    return success(this.service.getScaffoldStatus());
  }
}

export const createFavoritesController = (service: FavoritesService): FavoritesController =>
  new FavoritesController(service);
