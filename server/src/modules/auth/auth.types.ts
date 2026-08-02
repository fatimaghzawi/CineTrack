import type { UserPublic } from '@modules/users';

export type AuthTokens = {
  accessToken: string;
};

export type AuthUserSummary = Pick<UserPublic, 'id' | 'email' | 'displayName'>;

export type AuthResult = {
  user: AuthUserSummary;
};
