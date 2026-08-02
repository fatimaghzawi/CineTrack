import type { FastifyReply, FastifyRequest } from 'fastify';

import { success } from '@common/utils/response';

import type { CollectionsService } from './collections.service';

/**
 * Collections controller — thin HTTP adapters.
 * Parse/validate input, call the service, return response helpers.
 * No business rules and no direct database/API calls.
 */

export class CollectionsController {
  constructor(private readonly service: CollectionsService) {}

  async readiness(_request: FastifyRequest, _reply: FastifyReply) {
    return success(this.service.getScaffoldStatus());
  }
}

export const createCollectionsController = (service: CollectionsService): CollectionsController =>
  new CollectionsController(service);
