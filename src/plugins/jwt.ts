import jwt from '@fastify/jwt';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { AuthConstants } from '@common/constants/app';
import { env } from '@config/env';

const jwtPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
    cookie: {
      cookieName: AuthConstants.ACCESS_TOKEN_COOKIE,
      signed: false,
    },
  });
};

export default fp(jwtPlugin, { name: 'jwt' });
