import { z } from 'zod';

import {
  mediaTypeSchema,
  mongoObjectIdSchema,
  paginationQuerySchema,
  tmdbRefSchema,
} from '@common/validators';

export const createJournalEntrySchema = tmdbRefSchema.extend({
  title: z.string().trim().max(160).optional(),
  body: z.string().trim().min(1).max(10_000),
  watchedAt: z.coerce.date().optional(),
  mood: z.string().trim().max(40).optional(),
  isSpoiler: z.boolean().optional(),
});

export const updateJournalEntrySchema = z
  .object({
    title: z.string().trim().max(160).optional(),
    body: z.string().trim().min(1).max(10_000).optional(),
    watchedAt: z.coerce.date().nullable().optional(),
    mood: z.string().trim().max(40).optional(),
    isSpoiler: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.body !== undefined ||
      data.watchedAt !== undefined ||
      data.mood !== undefined ||
      data.isSpoiler !== undefined,
    { message: 'At least one field must be provided' },
  );

export const journalIdParamsSchema = z.object({
  id: mongoObjectIdSchema,
});

export const listJournalQuerySchema = paginationQuerySchema.extend({
  mediaType: mediaTypeSchema.optional(),
  tmdbId: z.coerce.number().int().positive().optional(),
});

export type CreateJournalEntryInput = z.infer<typeof createJournalEntrySchema>;
export type UpdateJournalEntryInput = z.infer<typeof updateJournalEntrySchema>;
export type JournalIdParams = z.infer<typeof journalIdParamsSchema>;
export type ListJournalQuery = z.infer<typeof listJournalQuerySchema>;
