import { z } from 'zod';

import {
  mediaTypeSchema,
  mongoObjectIdSchema,
  paginationQuerySchema,
  tmdbRefSchema,
} from '@common/validators';

export const createCollectionSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(1000).optional(),
  isPublic: z.boolean().optional(),
});

export const updateCollectionSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    description: z.string().trim().max(1000).optional(),
    isPublic: z.boolean().optional(),
    coverTmdbId: z.coerce.number().int().positive().nullable().optional(),
    coverMediaType: mediaTypeSchema.nullable().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.isPublic !== undefined ||
      data.coverTmdbId !== undefined ||
      data.coverMediaType !== undefined,
    { message: 'At least one field must be provided' },
  );

export const collectionIdParamsSchema = z.object({
  id: mongoObjectIdSchema,
});

export const addCollectionItemSchema = tmdbRefSchema.extend({
  note: z.string().trim().max(300).optional(),
});

export const removeCollectionItemSchema = tmdbRefSchema;

export const listCollectionsQuerySchema = paginationQuerySchema.extend({
  isPublic: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      return value === true || value === 'true';
    }),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
export type CollectionIdParams = z.infer<typeof collectionIdParamsSchema>;
export type AddCollectionItemInput = z.infer<typeof addCollectionItemSchema>;
export type RemoveCollectionItemInput = z.infer<typeof removeCollectionItemSchema>;
export type ListCollectionsQuery = z.infer<typeof listCollectionsQuerySchema>;
