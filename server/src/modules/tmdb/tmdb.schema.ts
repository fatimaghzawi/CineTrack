import { z } from 'zod';

import { paginationQuerySchema } from '@common/validators';

export const tmdbSearchQuerySchema = paginationQuerySchema.extend({
  query: z.string().trim().min(1).max(200),
  includeAdult: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((value) => value === true || value === 'true'),
});

export const tmdbIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const tmdbTrendingQuerySchema = paginationQuerySchema.extend({
  mediaType: z.enum(['all', 'movie', 'tv']).default('all'),
  timeWindow: z.enum(['day', 'week']).default('day'),
});

export const tmdbDiscoverQuerySchema = paginationQuerySchema.extend({
  sortBy: z.string().trim().min(1).max(100).optional(),
});

export type TmdbSearchQuery = z.infer<typeof tmdbSearchQuerySchema>;
export type TmdbIdParams = z.infer<typeof tmdbIdParamsSchema>;
export type TmdbTrendingQuery = z.infer<typeof tmdbTrendingQuerySchema>;
export type TmdbDiscoverQuery = z.infer<typeof tmdbDiscoverQuerySchema>;
