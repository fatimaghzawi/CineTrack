import type { MediaType } from '@common/constants/enums';
import type { TmdbRef } from '@common/types/media';

export type RecommendationSource = 'tmdb' | 'hybrid';

export type RecommendationItem = TmdbRef & {
  score: number | null;
  reason: string;
};

export type RecommendationCache = {
  id: string;
  userId: string;
  source: RecommendationSource;
  items: RecommendationItem[];
  generatedAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type RecommendationListFilters = {
  mediaType?: MediaType;
  refresh?: boolean;
};
