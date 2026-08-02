import { z } from 'zod';

import {
  mediaTypeSchema,
  mongoObjectIdSchema,
  paginationQuerySchema,
  tmdbRefSchema,
} from '@common/validators';

export const ratingScoreSchema = z.coerce.number().min(0.5).max(10);

export const createRatingSchema = tmdbRefSchema.extend({
  score: ratingScoreSchema,
  review: z.string().trim().max(2000).optional(),
});

export const updateRatingSchema = z
  .object({
    score: ratingScoreSchema.optional(),
    review: z.string().trim().max(2000).optional(),
  })
  .refine((data) => data.score !== undefined || data.review !== undefined, {
    message: 'At least one field must be provided',
  });

export const ratingIdParamsSchema = z.object({
  id: mongoObjectIdSchema,
});

export const listRatingsQuerySchema = paginationQuerySchema.extend({
  mediaType: mediaTypeSchema.optional(),
  minScore: ratingScoreSchema.optional(),
  maxScore: ratingScoreSchema.optional(),
});

export type CreateRatingInput = z.infer<typeof createRatingSchema>;
export type UpdateRatingInput = z.infer<typeof updateRatingSchema>;
export type RatingIdParams = z.infer<typeof ratingIdParamsSchema>;
export type ListRatingsQuery = z.infer<typeof listRatingsQuerySchema>;
