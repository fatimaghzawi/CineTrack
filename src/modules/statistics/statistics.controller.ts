import type { FastifyReply, FastifyRequest } from 'fastify';

import { success } from '@common/utils/response';

import type { StatisticsService } from './statistics.service';

/**
 * Statistics controller — thin HTTP adapters.
 * Parse/validate input, call the service, return response helpers.
 * No business rules and no direct database/API calls.
 */

export class StatisticsController {
  constructor(private readonly service: StatisticsService) {}

  async readiness(_request: FastifyRequest, _reply: FastifyReply) {
    return success(this.service.getScaffoldStatus());
  }
}

export const createStatisticsController = (service: StatisticsService): StatisticsController =>
  new StatisticsController(service);
