import type { FastifyReply, FastifyRequest } from 'fastify';

import { success } from '@common/utils/response';

import type { RecommendationsService } from './recommendations.service';

/**
 * Recommendations controller — thin HTTP adapters.
 * Parse/validate input, call the service, return response helpers.
 * No business rules and no direct database/API calls.
 */

export class RecommendationsController {
  constructor(private readonly service: RecommendationsService) {}

  async readiness(_request: FastifyRequest, _reply: FastifyReply) {
    return success(this.service.getScaffoldStatus());
  }
}

export const createRecommendationsController = (
  service: RecommendationsService,
): RecommendationsController => new RecommendationsController(service);
