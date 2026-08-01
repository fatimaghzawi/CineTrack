import type { FastifyReply, FastifyRequest } from 'fastify';

import { UnauthorizedError } from '@common/errors';
import type { AuthenticatedUser } from '@common/types/auth';

/**
 * Requires a valid JWT (Authorization Bearer or accessToken cookie).
 */
export async function authenticate(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  try {
    await request.jwtVerify();
  } catch {
    throw new UnauthorizedError('Invalid or missing access token');
  }
}

export function getAuthUser(request: FastifyRequest): AuthenticatedUser {
  if (!request.user?.sub) {
    throw new UnauthorizedError('Authentication required');
  }

  return request.user;
}
