import '@fastify/jwt';

import type { JwtPayload } from './auth';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}
