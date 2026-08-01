export const APP_NAME = 'CineTrack';
export const API_PREFIX = '/api/v1';

export const PaginationDefaults = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const AuthConstants = {
  ACCESS_TOKEN_COOKIE: 'accessToken',
  BEARER_PREFIX: 'Bearer ',
} as const;
