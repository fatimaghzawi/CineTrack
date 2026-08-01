import type { FastifyReply, FastifyRequest } from 'fastify';

import { success } from '@common/utils/response';

import type { WatchlistService } from './watchlist.service';

/**
 * Watchlist controller — thin HTTP adapters.
 * Parse/validate input, call the service, return response helpers.
 * No business rules and no direct database/API calls.
 */

export class WatchlistController {
  constructor(private readonly service: WatchlistService) {}

  async readiness(_request: FastifyRequest, _reply: FastifyReply) {
    return success(this.service.getScaffoldStatus());
  }
}

export const createWatchlistController = (service: WatchlistService): WatchlistController =>
  new WatchlistController(service);
