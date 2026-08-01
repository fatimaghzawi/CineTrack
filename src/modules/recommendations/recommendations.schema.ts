import { z } from 'zod';

import { mediaTypeSchema, paginationQuerySchema } from '@common/validators';

export const recommendationsQuerySchema = paginationQuerySchema.extend({
  mediaType: mediaTypeSchema.optional(),
  refresh: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((value) => value === true || value === 'true'),
});

export type RecommendationsQuery = z.infer<typeof recommendationsQuerySchema>;
