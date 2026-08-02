import type { MediaType, WatchStatus } from '@common/constants/enums';
import type { TmdbRef } from '@common/types/media';

export type WatchProgress = {
  season?: number;
  episode?: number;
  percent?: number;
};

export type WatchlistItem = TmdbRef & {
  id: string;
  userId: string;
  status: WatchStatus;
  progress: WatchProgress;
  notes: string;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateWatchlistItemData = TmdbRef & {
  status?: WatchStatus;
  progress?: WatchProgress;
  notes?: string;
};

export type UpdateWatchlistItemData = {
  status?: WatchStatus;
  progress?: WatchProgress;
  notes?: string;
};

export type WatchlistListFilters = {
  status?: WatchStatus;
  mediaType?: MediaType;
};
