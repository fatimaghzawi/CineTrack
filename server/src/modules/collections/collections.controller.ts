import type { FastifyReply, FastifyRequest } from 'fastify';

import { HttpStatus } from '@common/constants/http';
import { getAuthUser } from '@common/middleware';
import { success } from '@common/utils/response';
import { parseOrThrow } from '@common/validators';

import {
  addCollectionItemSchema,
  collectionIdParamsSchema,
  createCollectionSchema,
  listCollectionsQuerySchema,
  removeCollectionItemSchema,
  updateCollectionSchema,
} from './collections.schema';
import type { CollectionsService } from './collections.service';

export class CollectionsController {
  constructor(private readonly service: CollectionsService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const auth = getAuthUser(request);
    const body = parseOrThrow(createCollectionSchema, request.body);
    const collection = await this.service.create(auth.sub, body);
    return reply.status(HttpStatus.CREATED).send(success({ collection }));
  }

  async list(request: FastifyRequest, _reply: FastifyReply) {
    const auth = getAuthUser(request);
    const query = parseOrThrow(listCollectionsQuerySchema, request.query);
    const result = await this.service.list(
      auth.sub,
      { isPublic: query.isPublic },
      query.page,
      query.limit,
    );
    return success(result);
  }

  async getById(request: FastifyRequest, _reply: FastifyReply) {
    const auth = getAuthUser(request);
    const params = parseOrThrow(collectionIdParamsSchema, request.params);
    const collection = await this.service.getById(auth.sub, params.id);
    return success({ collection });
  }

  async update(request: FastifyRequest, _reply: FastifyReply) {
    const auth = getAuthUser(request);
    const params = parseOrThrow(collectionIdParamsSchema, request.params);
    const body = parseOrThrow(updateCollectionSchema, request.body);
    const collection = await this.service.update(auth.sub, params.id, body);
    return success({ collection });
  }

  async remove(request: FastifyRequest, _reply: FastifyReply) {
    const auth = getAuthUser(request);
    const params = parseOrThrow(collectionIdParamsSchema, request.params);
    await this.service.remove(auth.sub, params.id);
    return success({ message: 'Collection deleted' });
  }

  async addItem(request: FastifyRequest, reply: FastifyReply) {
    const auth = getAuthUser(request);
    const params = parseOrThrow(collectionIdParamsSchema, request.params);
    const body = parseOrThrow(addCollectionItemSchema, request.body);
    const collection = await this.service.addItem(auth.sub, params.id, body);
    return reply.status(HttpStatus.CREATED).send(success({ collection }));
  }

  async removeItem(request: FastifyRequest, _reply: FastifyReply) {
    const auth = getAuthUser(request);
    const params = parseOrThrow(collectionIdParamsSchema, request.params);
    const body = parseOrThrow(removeCollectionItemSchema, request.body);
    const collection = await this.service.removeItem(
      auth.sub,
      params.id,
      body.tmdbId,
      body.mediaType,
    );
    return success({ collection });
  }
}

export const createCollectionsController = (service: CollectionsService): CollectionsController =>
  new CollectionsController(service);
