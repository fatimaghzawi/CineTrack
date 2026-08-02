import type { MediaType } from '@common/constants/enums';
import type { TmdbRef } from '@common/types/media';

export type FavoriteItem = TmdbRef & {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateFavoriteData = TmdbRef;

export type FavoriteListFilters = {
  mediaType?: MediaType;
};
