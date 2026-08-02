import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    displayName: z.string().trim().min(2).max(80).optional(),
  })
  .refine((data) => data.displayName !== undefined, {
    message: 'At least one field must be provided',
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
