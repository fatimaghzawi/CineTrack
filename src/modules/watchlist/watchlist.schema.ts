import { z } from 'zod';

import { WatchStatus } from '@common/constants/enums';
import {
  mediaTypeSchema,
  mongoObjectIdSchema,
  paginationQuerySchema,
  tmdbRefSchema,
  watchStatusSchema,
} from '@common/validators';

export const watchProgressSchema = z
  .object({
    season: z.coerce.number().int().min(0).optional(),
    episode: z.coerce.number().int().min(0).optional(),
    percent: z.coerce.number().min(0).max(100).optional(),
  })
  .optional();

export const createWatchlistItemSchema = tmdbRefSchema.extend({
  status: watchStatusSchema.default(WatchStatus.PLAN_TO_WATCH),
  progress: watchProgressSchema,
  notes: z.string().trim().max(500).optional(),
});

export const updateWatchlistItemSchema = z
  .object({
    status: watchStatusSchema.optional(),
    progress: watchProgressSchema,
    notes: z.string().trim().max(500).optional(),
  })
  .refine(
    (data) => data.status !== undefined || data.progress !== undefined || data.notes !== undefined,
    { message: 'At least one field must be provided' },
  );

export const watchlistIdParamsSchema = z.object({
  id: mongoObjectIdSchema,
});

export const listWatchlistQuerySchema = paginationQuerySchema.extend({
  status: watchStatusSchema.optional(),
  mediaType: mediaTypeSchema.optional(),
});

export type CreateWatchlistItemInput = z.infer<typeof createWatchlistItemSchema>;
export type UpdateWatchlistItemInput = z.infer<typeof updateWatchlistItemSchema>;
export type WatchlistIdParams = z.infer<typeof watchlistIdParamsSchema>;
export type ListWatchlistQuery = z.infer<typeof listWatchlistQuerySchema>;
