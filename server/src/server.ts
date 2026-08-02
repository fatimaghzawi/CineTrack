import { env } from '@config/env';
import { connectDatabase, disconnectDatabase } from '@database/index';

import { buildApp, type AppInstance } from './app';

let app: AppInstance | undefined;
let isShuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  app?.log.info(`Received ${signal}, starting graceful shutdown`);

  try {
    await app?.close();
    app?.log.info('HTTP server closed');

    await disconnectDatabase(app?.log);
    process.exit(0);
  } catch (error) {
    app?.log.error({ err: error }, 'Error during graceful shutdown');
    process.exit(1);
  }
}

function registerProcessHandlers(): void {
  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.on(signal, () => {
      void shutdown(signal);
    });
  }

  process.on('uncaughtException', (error) => {
    app?.log.error({ err: error }, 'Uncaught exception');
    void shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason) => {
    app?.log.error({ err: reason }, 'Unhandled promise rejection');
    void shutdown('unhandledRejection');
  });
}

async function main(): Promise<void> {
  app = await buildApp();
  registerProcessHandlers();

  try {
    await connectDatabase(app.log);
    await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info(`CineTrack API listening on http://${env.HOST}:${env.PORT}`);
    app.log.info(`Swagger docs available at http://${env.HOST}:${env.PORT}/docs`);
  } catch (error) {
    app.log.error({ err: error }, 'Failed to start server');
    await disconnectDatabase(app.log).catch(() => undefined);
    process.exit(1);
  }
}

void main();
