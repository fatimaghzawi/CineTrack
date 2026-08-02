import type { FastifyReply, FastifyRequest } from 'fastify';

import { success } from '@common/utils/response';

import type { RatingsService } from './ratings.service';

/**
 * Ratings controller — thin HTTP adapters.
 * Parse/validate input, call the service, return response helpers.
 * No business rules and no direct database/API calls.
 */

export class RatingsController {
  constructor(private readonly service: RatingsService) {}

  async readiness(_request: FastifyRequest, _reply: FastifyReply) {
    return success(this.service.getScaffoldStatus());
  }
}

export const createRatingsController = (service: RatingsService): RatingsController =>
  new RatingsController(service);
