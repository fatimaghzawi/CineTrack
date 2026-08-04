import type { FastifyReply, FastifyRequest } from 'fastify';

import { getAuthUser } from '@common/middleware';
import { success } from '@common/utils/response';
import { parseOrThrow } from '@common/validators';

import { recommendationsQuerySchema } from './recommendations.schema';
import type { RecommendationsService } from './recommendations.service';

export class RecommendationsController {
  constructor(private readonly service: RecommendationsService) {}

  async list(request: FastifyRequest, _reply: FastifyReply) {
    const auth = getAuthUser(request);
    const query = parseOrThrow(recommendationsQuerySchema, request.query);
    const result = await this.service.listForUser(auth.sub, {
      page: query.page,
      limit: query.limit,
      mediaType: query.mediaType,
      refresh: query.refresh,
    });

    return success(result);
  }
}

export const createRecommendationsController = (
  service: RecommendationsService,
): RecommendationsController => new RecommendationsController(service);
