import { config as loadDotenv } from 'dotenv';
import { prettifyError } from 'zod';

import { envSchema } from './env.schema';

loadDotenv();

function resolveCorsOrigin(value: string | undefined): true | string {
  if (!value || value === 'true') {
    return true;
  }

  return value;
}

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const details = prettifyError(parsed.error);
    throw new Error(`Invalid environment configuration:\n${details}`);
  }

  const data = parsed.data;

  return {
    NODE_ENV: data.NODE_ENV,
    isProduction: data.NODE_ENV === 'production',
    isDevelopment: data.NODE_ENV === 'development',
    isTest: data.NODE_ENV === 'test',
    PORT: data.PORT,
    HOST: data.HOST,
    MONGODB_URI: data.MONGODB_URI,
    JWT_SECRET: data.JWT_SECRET,
    JWT_EXPIRES_IN: data.JWT_EXPIRES_IN,
    TMDB_API_KEY: data.TMDB_API_KEY,
    TMDB_BASE_URL: data.TMDB_BASE_URL,
    /**
     * `true` reflects the request origin (dev-friendly).
     * Set to a concrete origin string in production (e.g. https://app.example.com).
     */
    CORS_ORIGIN: resolveCorsOrigin(data.CORS_ORIGIN),
  } as const;
}

/**
 * Validated application configuration.
 * Importing this module fails fast when required env vars are missing/invalid.
 */
export const env = loadEnv();

export type Env = typeof env;
