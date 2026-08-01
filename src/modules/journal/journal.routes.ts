import type { FastifyPluginAsync } from 'fastify';

import { createJournalController } from './journal.controller';
import { journalRepository } from './journal.repository';
import { createJournalService } from './journal.service';

/**
 * Journal routes — wires URL paths to controller methods.
 */
const journalRoutes: FastifyPluginAsync = async (fastify) => {
  const service = createJournalService(journalRepository);
  const controller = createJournalController(service);

  fastify.get(
    '/journal/health',
    {
      schema: {
        tags: ['Journal'],
        summary: 'Journal module scaffold health',
        response: {
          200: {
            type: 'object',
            required: ['success', 'data'],
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                required: ['module', 'status', 'persistence'],
                properties: {
                  module: { type: 'string' },
                  status: { type: 'string' },
                  persistence: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => controller.readiness(request, reply),
  );
};

export default journalRoutes;
