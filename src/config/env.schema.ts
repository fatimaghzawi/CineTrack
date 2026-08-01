import { z } from 'zod';

/**
 * Raw process.env schema.
 * Required keys fail startup when missing or invalid.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535),
  HOST: z.string().min(1).default('0.0.0.0'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().min(1, 'JWT_EXPIRES_IN is required'),
  TMDB_API_KEY: z.string().min(1, 'TMDB_API_KEY is required'),
  TMDB_BASE_URL: z.url('TMDB_BASE_URL must be a valid URL'),
  CORS_ORIGIN: z.string().optional(),
});

export type RawEnv = z.infer<typeof envSchema>;
