import type { FastifyReply, FastifyRequest } from 'fastify';

import { HttpStatus } from '@common/constants/http';
import { getAuthUser } from '@common/middleware';
import { success } from '@common/utils/response';
import { parseOrThrow } from '@common/validators';

import {
  createJournalEntrySchema,
  journalIdParamsSchema,
  listJournalQuerySchema,
  updateJournalEntrySchema,
} from './journal.schema';
import type { JournalService } from './journal.service';

/**
 * Journal controller — thin HTTP adapters.
 * Parse/validate input, call the service, return response helpers.
 * No business rules and no direct database/API calls.
 */
export class JournalController {
  constructor(private readonly service: JournalService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const auth = getAuthUser(request);
    const body = parseOrThrow(createJournalEntrySchema, request.body);
    const entry = await this.service.create(auth.sub, body);

    return reply.status(HttpStatus.CREATED).send(success({ entry }));
  }

  async list(request: FastifyRequest, _reply: FastifyReply) {
    const auth = getAuthUser(request);
    const query = parseOrThrow(listJournalQuerySchema, request.query);
    const { page, limit, mediaType, tmdbId } = query;
    const result = await this.service.list(auth.sub, { mediaType, tmdbId }, page, limit);

    return success(result);
  }

  async getById(request: FastifyRequest, _reply: FastifyReply) {
    const auth = getAuthUser(request);
    const params = parseOrThrow(journalIdParamsSchema, request.params);
    const entry = await this.service.getById(auth.sub, params.id);

    return success({ entry });
  }

  async update(request: FastifyRequest, _reply: FastifyReply) {
    const auth = getAuthUser(request);
    const params = parseOrThrow(journalIdParamsSchema, request.params);
    const body = parseOrThrow(updateJournalEntrySchema, request.body);
    const entry = await this.service.update(auth.sub, params.id, body);

    return success({ entry });
  }

  async remove(request: FastifyRequest, _reply: FastifyReply) {
    const auth = getAuthUser(request);
    const params = parseOrThrow(journalIdParamsSchema, request.params);
    await this.service.remove(auth.sub, params.id);

    return success({ message: 'Journal entry deleted' });
  }
}

export const createJournalController = (service: JournalService): JournalController =>
  new JournalController(service);
