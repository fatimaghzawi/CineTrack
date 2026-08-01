import { ConflictError, UnauthorizedError } from '@common/errors';
import type { UsersRepository } from '@modules/users';

import { hashPassword, verifyPassword } from './auth.password';
import type { LoginInput, RegisterInput } from './auth.schema';
import type { AuthResult } from './auth.types';

/**
 * Auth service — registration and login business logic.
 * JWT signing stays in the controller (Fastify reply helper).
 */
export class AuthService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await this.usersRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('Email is already registered');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await this.usersRepository.create({
      email: input.email,
      passwordHash,
      displayName: input.displayName,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
    };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.usersRepository.findByEmailWithPassword(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
    };
  }
}

export const createAuthService = (usersRepository: UsersRepository): AuthService =>
  new AuthService(usersRepository);
