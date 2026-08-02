import Fastify from 'fastify';

import { success } from '@common/utils/response';
import { buildLoggerConfig } from '@common/utils/logger';
import { registerModules } from '@modules/index';
import { registerPlugins } from '@plugins/index';

export async function buildApp() {
  const app = Fastify({
    logger: buildLoggerConfig(),
    trustProxy: true,
    ajv: {
      customOptions: {
        removeAdditional: 'all',
        coerceTypes: true,
        allErrors: true,
      },
    },
  });

  await registerPlugins(app);
  await registerModules(app);

  app.get(
    '/health',
    {
      schema: {
        tags: ['Health'],
        summary: 'Health check',
        response: {
          200: {
            type: 'object',
            required: ['success', 'data'],
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                required: ['status', 'timestamp'],
                properties: {
                  status: { type: 'string' },
                  timestamp: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async () =>
      success({
        status: 'ok',
        timestamp: new Date().toISOString(),
      }),
  );

  return app;
}

export type AppInstance = Awaited<ReturnType<typeof buildApp>>;
