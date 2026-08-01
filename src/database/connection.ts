import mongoose from 'mongoose';

import { env } from '@config/env';

export type DatabaseLogger = {
  info: (obj: unknown, msg?: string) => void;
  warn: (obj: unknown, msg?: string) => void;
  error: (obj: unknown, msg?: string) => void;
  debug?: (obj: unknown, msg?: string) => void;
};

const CONNECTION_EVENTS = ['connected', 'disconnected', 'reconnected', 'error'] as const;

let listenersAttached = false;
let hasConnectedOnce = false;

function attachConnectionListeners(logger: DatabaseLogger): void {
  if (listenersAttached) {
    return;
  }

  const { connection } = mongoose;

  connection.on('connected', () => {
    hasConnectedOnce = true;
    logger.info({}, 'MongoDB connection established');
  });

  connection.on('disconnected', () => {
    // Avoid noisy warnings during a failed initial connection attempt.
    if (hasConnectedOnce) {
      logger.warn({}, 'MongoDB disconnected');
    }
  });

  connection.on('reconnected', () => {
    logger.info({}, 'MongoDB reconnected');
  });

  connection.on('error', (error: Error) => {
    logger.error({ err: error }, 'MongoDB connection error');
  });

  listenersAttached = true;
}

/**
 * Opens a shared Mongoose connection for the process.
 * Schemas/models are registered by feature modules later — not here.
 */
export async function connectDatabase(logger: DatabaseLogger): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    logger.debug?.({}, 'MongoDB already connected');
    return mongoose;
  }

  attachConnectionListeners(logger);

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 5_000,
      socketTimeoutMS: 45_000,
    });

    hasConnectedOnce = true;

    logger.info(
      {
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        readyState: mongoose.connection.readyState,
      },
      'MongoDB connected successfully',
    );

    return mongoose;
  } catch (error) {
    logger.error({ err: error }, 'Failed to connect to MongoDB');
    throw error;
  }
}

/**
 * Closes the Mongoose connection during graceful shutdown.
 */
export async function disconnectDatabase(logger?: DatabaseLogger): Promise<void> {
  if (mongoose.connection.readyState === 0) {
    logger?.debug?.({}, 'MongoDB already disconnected');
    return;
  }

  await mongoose.connection.close();
  logger?.info({}, 'MongoDB connection closed');
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export function getDatabaseReadyState(): number {
  return mongoose.connection.readyState;
}

export { CONNECTION_EVENTS };
