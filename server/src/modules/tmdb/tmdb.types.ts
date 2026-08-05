export type TmdbMediaType = 'movie' | 'tv';

export type TmdbSearchParams = {
  query: string;
  page?: number;
  includeAdult?: boolean;
};

export type TmdbDiscoverParams = {
  page?: number;
  sortBy?: string;
  /** Comma-separated TMDb genre ids, e.g. "28" or "28,53". */
  withGenres?: string;
};

export type TmdbTrendingParams = {
  mediaType?: 'all' | 'movie' | 'tv';
  timeWindow?: 'day' | 'week';
  page?: number;
};
