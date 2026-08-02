// ─── Enums ───────────────────────────────────────────────────────
export type MediaType = 'movie' | 'tv';

export type WatchStatus =
  | 'plan_to_watch'
  | 'watching'
  | 'completed'
  | 'dropped';

export const WATCH_STATUS_LABELS: Record<WatchStatus, string> = {
  plan_to_watch: 'Plan to Watch',
  watching: 'Watching',
  completed: 'Completed',
  dropped: 'Dropped',
};

// ─── TMDb ────────────────────────────────────────────────────────
export interface TmdbMedia {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  media_type?: MediaType;
  popularity: number;
}

export interface TmdbMovieDetails extends TmdbMedia {
  runtime: number;
  genres: { id: number; name: string }[];
  tagline: string;
  status: string;
  budget: number;
  revenue: number;
  credits?: {
    cast: TmdbCastMember[];
    crew: TmdbCrewMember[];
  };
  videos?: {
    results: TmdbVideo[];
  };
  recommendations?: {
    results: TmdbMedia[];
  };
}

export interface TmdbTvDetails extends TmdbMedia {
  number_of_seasons: number;
  number_of_episodes: number;
  genres: { id: number; name: string }[];
  tagline: string;
  status: string;
  episode_run_time: number[];
  created_by: { id: number; name: string }[];
  credits?: {
    cast: TmdbCastMember[];
    crew: TmdbCrewMember[];
  };
  videos?: {
    results: TmdbVideo[];
  };
  recommendations?: {
    results: TmdbMedia[];
  };
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TmdbCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TmdbVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface TmdbSearchResults {
  page: number;
  results: TmdbMedia[];
  total_pages: number;
  total_results: number;
}

// ─── Watchlist ───────────────────────────────────────────────────
export interface WatchProgress {
  season?: number;
  episode?: number;
  percent?: number;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  tmdbId: number;
  mediaType: MediaType;
  status: WatchStatus;
  progress: WatchProgress;
  notes: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Favorites ───────────────────────────────────────────────────
export interface FavoriteItem {
  id: string;
  userId: string;
  tmdbId: number;
  mediaType: MediaType;
  createdAt: string;
  updatedAt: string;
}

// ─── Ratings ─────────────────────────────────────────────────────
export interface RatingItem {
  id: string;
  userId: string;
  tmdbId: number;
  mediaType: MediaType;
  score: number;
  review: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Journal ─────────────────────────────────────────────────────
export interface JournalEntry {
  id: string;
  userId: string;
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  body: string;
  watchedAt: string | null;
  mood: string;
  isSpoiler: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Collections ─────────────────────────────────────────────────
export interface CollectionItemRef {
  tmdbId: number;
  mediaType: MediaType;
  note: string;
  addedAt: string;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description: string;
  isPublic: boolean;
  coverTmdbId: number | null;
  coverMediaType: MediaType | null;
  items: CollectionItemRef[];
  createdAt: string;
  updatedAt: string;
}

// ─── Statistics ──────────────────────────────────────────────────
export interface StatisticsTotals {
  watchlist: number;
  completed: number;
  watching: number;
  planToWatch: number;
  dropped: number;
  favorites: number;
  ratings: number;
  journalEntries: number;
  collections: number;
}

export interface StatisticsSnapshot {
  id: string;
  userId: string;
  totals: StatisticsTotals;
  byMediaType: { movie: number; tv: number };
  ratings: {
    averageScore: number | null;
    highestScore: number | null;
    lowestScore: number | null;
  };
  lastComputedAt: string;
}
