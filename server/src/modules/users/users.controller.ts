import type { FastifyReply, FastifyRequest } from 'fastify';

import { getAuthUser } from '@common/middleware';
import { success } from '@common/utils/response';
import { parseOrThrow } from '@common/validators';

import { updateProfileSchema } from './users.schema';
import type { UsersService } from './users.service';

export class UsersController {
  constructor(private readonly service: UsersService) {}

  async getMe(request: FastifyRequest, _reply: FastifyReply) {
    const auth = getAuthUser(request);
    const user = await this.service.getById(auth.sub);
    return success({ user });
  }

  async updateMe(request: FastifyRequest, _reply: FastifyReply) {
    const auth = getAuthUser(request);
    const body = parseOrThrow(updateProfileSchema, request.body);
    const user = await this.service.updateProfile(auth.sub, body);
    return success({ user });
  }
}

export const createUsersController = (service: UsersService): UsersController =>
  new UsersController(service);
