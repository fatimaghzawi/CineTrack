/**
 * Shared domain enums — vocabulary only, no business rules.
 */

export const MediaType = {
  MOVIE: 'movie',
  TV: 'tv',
} as const;

export type MediaType = (typeof MediaType)[keyof typeof MediaType];

export const WatchStatus = {
  PLAN_TO_WATCH: 'plan_to_watch',
  WATCHING: 'watching',
  COMPLETED: 'completed',
  DROPPED: 'dropped',
} as const;

export type WatchStatus = (typeof WatchStatus)[keyof typeof WatchStatus];

export const SortOrder = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
