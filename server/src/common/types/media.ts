import type { MediaType } from '@common/constants/enums';

/**
 * Canonical reference to a TMDb title.
 * Movies/TV are never stored as first-class documents — only references.
 */
export type TmdbRef = {
  tmdbId: number;
  mediaType: MediaType;
};
