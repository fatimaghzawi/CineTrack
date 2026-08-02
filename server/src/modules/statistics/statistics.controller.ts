import type { FastifyReply, FastifyRequest } from 'fastify';

import { getAuthUser } from '@common/middleware';
import { success } from '@common/utils/response';
import { parseOrThrow } from '@common/validators';

import { statisticsQuerySchema } from './statistics.schema';
import type { StatisticsService } from './statistics.service';

/**
 * Statistics controller — thin HTTP adapters.
 * Parse/validate input, call the service, return response helpers.
 * No business rules and no direct database/API calls.
 */
export class StatisticsController {
  constructor(private readonly service: StatisticsService) {}

  async getMine(request: FastifyRequest, _reply: FastifyReply) {
    const auth = getAuthUser(request);
    const query = parseOrThrow(statisticsQuerySchema, request.query);
    const statistics = await this.service.getForUser(auth.sub, query.refresh ?? false);

    return success({ statistics });
  }
}

export const createStatisticsController = (service: StatisticsService): StatisticsController =>
  new StatisticsController(service);
