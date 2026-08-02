import { z } from 'zod';

export const statisticsQuerySchema = z.object({
  refresh: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((value) => value === true || value === 'true'),
});

export type StatisticsQuery = z.infer<typeof statisticsQuerySchema>;
