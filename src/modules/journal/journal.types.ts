import type { MediaType } from '@common/constants/enums';
import type { TmdbRef } from '@common/types/media';

export type JournalEntry = TmdbRef & {
  id: string;
  userId: string;
  title: string;
  body: string;
  watchedAt: Date | null;
  mood: string;
  isSpoiler: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateJournalEntryData = TmdbRef & {
  title?: string;
  body: string;
  watchedAt?: Date;
  mood?: string;
  isSpoiler?: boolean;
};

export type UpdateJournalEntryData = {
  title?: string;
  body?: string;
  watchedAt?: Date | null;
  mood?: string;
  isSpoiler?: boolean;
};

export type JournalListFilters = {
  mediaType?: MediaType;
  tmdbId?: number;
};
