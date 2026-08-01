import type { FastifyReply, FastifyRequest } from 'fastify';

import { success } from '@common/utils/response';

import type { JournalService } from './journal.service';

/**
 * Journal controller — thin HTTP adapters.
 * Parse/validate input, call the service, return response helpers.
 * No business rules and no direct database/API calls.
 */

export class JournalController {
  constructor(private readonly service: JournalService) {}

  async readiness(_request: FastifyRequest, _reply: FastifyReply) {
    return success(this.service.getScaffoldStatus());
  }
}

export const createJournalController = (service: JournalService): JournalController =>
  new JournalController(service);
