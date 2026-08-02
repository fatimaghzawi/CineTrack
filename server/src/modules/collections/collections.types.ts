import type { MediaType } from '@common/constants/enums';
import type { TmdbRef } from '@common/types/media';

export type CollectionItem = TmdbRef & {
  note: string;
  addedAt: Date;
};

export type Collection = {
  id: string;
  userId: string;
  name: string;
  description: string;
  isPublic: boolean;
  coverTmdbId: number | null;
  coverMediaType: MediaType | null;
  items: CollectionItem[];
  createdAt: Date;
  updatedAt: Date;
};

export type CreateCollectionData = {
  name: string;
  description?: string;
  isPublic?: boolean;
};

export type UpdateCollectionData = {
  name?: string;
  description?: string;
  isPublic?: boolean;
  coverTmdbId?: number | null;
  coverMediaType?: MediaType | null;
};

export type AddCollectionItemData = TmdbRef & {
  note?: string;
};

export type CollectionListFilters = {
  isPublic?: boolean;
};
