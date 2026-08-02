import { NotFoundError } from '@common/errors';

import type { UsersRepository } from './users.repository';
import type { UpdateUserProfileInput, UserPublic } from './users.types';

/**
 * Users service — profile business logic.
 */
export class UsersService {
  constructor(private readonly repository: UsersRepository) {}

  async getById(userId: string): Promise<UserPublic> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, input: UpdateUserProfileInput): Promise<UserPublic> {
    const user = await this.repository.updateById(userId, input);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }
}

export const createUsersService = (repository: UsersRepository): UsersService =>
  new UsersService(repository);
