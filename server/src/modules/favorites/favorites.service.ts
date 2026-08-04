import { ConflictError, NotFoundError } from '@common/errors';
import type { PaginatedData } from '@common/types/api';
import { paginated } from '@common/utils/response';

import type { FavoritesRepository } from './favorites.repository';
import type { CreateFavoriteData, FavoriteItem, FavoriteListFilters } from './favorites.types';

function isDuplicateKeyError(error: unknown): boolean {
  return Boolean(
    error &&
    typeof error === 'object' &&
    'code' in error &&
    (error as { code: number }).code === 11000,
  );
}

export class FavoritesService {
  constructor(private readonly repository: FavoritesRepository) {}

  async create(userId: string, data: CreateFavoriteData): Promise<FavoriteItem> {
    try {
      return await this.repository.create(userId, data);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictError('Title is already in favorites');
      }
      throw error;
    }
  }

  async list(
    userId: string,
    filters: FavoriteListFilters,
    page: number,
    limit: number,
  ): Promise<PaginatedData<FavoriteItem>> {
    const { items, total } = await this.repository.listForUser(userId, filters, page, limit);
    return paginated(items, page, limit, total);
  }

  async removeById(userId: string, id: string): Promise<void> {
    const deleted = await this.repository.deleteByIdForUser(id, userId);
    if (!deleted) {
      throw new NotFoundError('Favorite not found');
    }
  }

  async removeByRef(userId: string, tmdbId: number, mediaType: string): Promise<void> {
    const deleted = await this.repository.deleteByRefForUser(userId, tmdbId, mediaType);
    if (!deleted) {
      throw new NotFoundError('Favorite not found');
    }
  }
}

export const createFavoritesService = (repository: FavoritesRepository): FavoritesService =>
  new FavoritesService(repository);
