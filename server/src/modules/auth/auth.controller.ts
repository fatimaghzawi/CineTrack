import type { FastifyReply, FastifyRequest } from 'fastify';

import { AuthConstants } from '@common/constants/app';
import { env } from '@config/env';
import { HttpStatus } from '@common/constants/http';
import { success } from '@common/utils/response';
import { parseOrThrow } from '@common/validators';

import { loginSchema, registerSchema } from './auth.schema';
import type { AuthService } from './auth.service';

export class AuthController {
  constructor(private readonly service: AuthService) {}

  async register(request: FastifyRequest, reply: FastifyReply) {
    const body = parseOrThrow(registerSchema, request.body);
    const result = await this.service.register(body);
    const accessToken = await reply.jwtSign({
      sub: result.user.id,
      email: result.user.email,
    });

    this.setAccessTokenCookie(reply, accessToken);

    return reply.status(HttpStatus.CREATED).send(
      success({
        user: result.user,
        accessToken,
      }),
    );
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const body = parseOrThrow(loginSchema, request.body);
    const result = await this.service.login(body);
    const accessToken = await reply.jwtSign({
      sub: result.user.id,
      email: result.user.email,
    });

    this.setAccessTokenCookie(reply, accessToken);

    return success({
      user: result.user,
      accessToken,
    });
  }

  async logout(_request: FastifyRequest, reply: FastifyReply) {
    reply.clearCookie(AuthConstants.ACCESS_TOKEN_COOKIE, {
      path: '/',
    });

    return success({ message: 'Logged out' });
  }

  private setAccessTokenCookie(reply: FastifyReply, accessToken: string): void {
    reply.setCookie(AuthConstants.ACCESS_TOKEN_COOKIE, accessToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: env.isProduction,
    });
  }
}

export const createAuthController = (service: AuthService): AuthController =>
  new AuthController(service);
