import type { FastifyReply, FastifyRequest } from 'fastify';

import { HttpStatus } from '@common/constants/http';
import { getAuthUser } from '@common/middleware';
import { success } from '@common/utils/response';
import { parseOrThrow } from '@common/validators';

import {
  createRatingSchema,
  listRatingsQuerySchema,
  ratingIdParamsSchema,
  updateRatingSchema,
} from './ratings.schema';
import type { RatingsService } from './ratings.service';

export class RatingsController {
  constructor(private readonly service: RatingsService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const auth = getAuthUser(request);
    const body = parseOrThrow(createRatingSchema, request.body);
    const rating = await this.service.create(auth.sub, body);
    return reply.status(HttpStatus.CREATED).send(success({ rating }));
  }

  async list(request: FastifyRequest, _reply: FastifyReply) {
    const auth = getAuthUser(request);
    const query = parseOrThrow(listRatingsQuerySchema, request.query);
    const { page, limit, mediaType, minScore, maxScore } = query;
    const result = await this.service.list(
      auth.sub,
      { mediaType, minScore, maxScore },
      page,
      limit,
    );
    return success(result);
  }

  async getById(request: FastifyRequest, _reply: FastifyReply) {
    const auth = getAuthUser(request);
    const params = parseOrThrow(ratingIdParamsSchema, request.params);
    const rating = await this.service.getById(auth.sub, params.id);
    return success({ rating });
  }

  async update(request: FastifyRequest, _reply: FastifyReply) {
    const auth = getAuthUser(request);
    const params = parseOrThrow(ratingIdParamsSchema, request.params);
    const body = parseOrThrow(updateRatingSchema, request.body);
    const rating = await this.service.update(auth.sub, params.id, body);
    return success({ rating });
  }

  async remove(request: FastifyRequest, _reply: FastifyReply) {
    const auth = getAuthUser(request);
    const params = parseOrThrow(ratingIdParamsSchema, request.params);
    await this.service.remove(auth.sub, params.id);
    return success({ message: 'Rating deleted' });
  }
}

export const createRatingsController = (service: RatingsService): RatingsController =>
  new RatingsController(service);
