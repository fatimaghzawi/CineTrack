import { z } from 'zod';

import {
  mediaTypeSchema,
  mongoObjectIdSchema,
  paginationQuerySchema,
  tmdbRefSchema,
} from '@common/validators';

export const createFavoriteSchema = tmdbRefSchema;

export const favoriteIdParamsSchema = z.object({
  id: mongoObjectIdSchema,
});

export const favoriteRefParamsSchema = tmdbRefSchema;

export const listFavoritesQuerySchema = paginationQuerySchema.extend({
  mediaType: mediaTypeSchema.optional(),
});

export type CreateFavoriteInput = z.infer<typeof createFavoriteSchema>;
export type FavoriteIdParams = z.infer<typeof favoriteIdParamsSchema>;
export type FavoriteRefParams = z.infer<typeof favoriteRefParamsSchema>;
export type ListFavoritesQuery = z.infer<typeof listFavoritesQuerySchema>;
