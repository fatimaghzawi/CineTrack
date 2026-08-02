export type UserPublic = {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateUserInput = {
  email: string;
  passwordHash: string;
  displayName: string;
};

export type UpdateUserProfileInput = {
  displayName?: string;
};

export type UsersScaffoldStatus = {
  module: 'users';
  status: 'scaffold';
  persistence: boolean;
};
