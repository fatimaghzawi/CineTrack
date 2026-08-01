import type { MediaType } from '@common/constants/enums';
import type { TmdbRef } from '@common/types/media';

export type RatingItem = TmdbRef & {
  id: string;
  userId: string;
  score: number;
  review: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateRatingData = TmdbRef & {
  score: number;
  review?: string;
};

export type UpdateRatingData = {
  score?: number;
  review?: string;
};

export type RatingListFilters = {
  mediaType?: MediaType;
  minScore?: number;
  maxScore?: number;
};
