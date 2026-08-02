import type { UserDocument } from './users.model';
import { UserModel } from './users.model';
import type { CreateUserInput, UpdateUserProfileInput, UserPublic } from './users.types';

function toPublicUser(user: UserDocument): UserPublic {
  return {
    id: String(user._id),
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Users repository — database access only.
 */
export class UsersRepository {
  isReady(): boolean {
    return true;
  }

  async create(input: CreateUserInput): Promise<UserPublic> {
    const user = await UserModel.create(input);
    return toPublicUser(user);
  }

  async findByEmail(email: string): Promise<UserPublic | null> {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    return user ? toPublicUser(user) : null;
  }

  async findByEmailWithPassword(
    email: string,
  ): Promise<(UserPublic & { passwordHash: string }) | null> {
    const user = await UserModel.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user || !user.passwordHash) {
      return null;
    }

    return {
      ...toPublicUser(user),
      passwordHash: user.passwordHash,
    };
  }

  async findById(id: string): Promise<UserPublic | null> {
    const user = await UserModel.findById(id);
    return user ? toPublicUser(user) : null;
  }

  async updateById(id: string, input: UpdateUserProfileInput): Promise<UserPublic | null> {
    const user = await UserModel.findByIdAndUpdate(id, input, {
      new: true,
      runValidators: true,
    });
    return user ? toPublicUser(user) : null;
  }
}

export const usersRepository = new UsersRepository();
