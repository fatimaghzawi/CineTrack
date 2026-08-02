import type { ZodError, ZodType } from 'zod';

import { ValidationError } from '@common/errors';

/**
 * Parses unknown input with a Zod schema.
 * Throws ValidationError (operational) on failure — never returns invalid data.
 */
export function parseOrThrow<T>(
  schema: ZodType<T>,
  data: unknown,
  message = 'Validation failed',
): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ValidationError(message, {
      details: formatZodError(result.error),
    });
  }

  return result.data;
}

export function formatZodError(error: ZodError): Array<{ path: string; message: string }> {
  return error.issues.map((issue) => ({
    path: issue.path.join('.') || '(root)',
    message: issue.message,
  }));
}
