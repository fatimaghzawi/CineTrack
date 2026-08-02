import { z } from 'zod';

import { MediaType, PaginationDefaults, SortOrder, WatchStatus } from '@common/constants';

export const mediaTypeSchema = z.enum([MediaType.MOVIE, MediaType.TV]);

export const watchStatusSchema = z.enum([
  WatchStatus.PLAN_TO_WATCH,
  WatchStatus.WATCHING,
  WatchStatus.COMPLETED,
  WatchStatus.DROPPED,
]);

export const sortOrderSchema = z.enum([SortOrder.ASC, SortOrder.DESC]);

export const tmdbIdSchema = z.coerce.number().int().positive();

export const tmdbRefSchema = z.object({
  tmdbId: tmdbIdSchema,
  mediaType: mediaTypeSchema,
});

export const mongoObjectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, 'Invalid MongoDB ObjectId');

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(PaginationDefaults.PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PaginationDefaults.MAX_LIMIT)
    .default(PaginationDefaults.LIMIT),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
