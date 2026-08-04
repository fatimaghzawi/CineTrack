import { ConflictError, NotFoundError } from '@common/errors';
import type { PaginatedData } from '@common/types/api';
import { paginated } from '@common/utils/response';

import type { WatchlistRepository } from './watchlist.repository';
import type {
  CreateWatchlistItemData,
  UpdateWatchlistItemData,
  WatchlistItem,
  WatchlistListFilters,
} from './watchlist.types';

function isDuplicateKeyError(error: unknown): boolean {
  return Boolean(
    error &&
    typeof error === 'object' &&
    'code' in error &&
    (error as { code: number }).code === 11000,
  );
}

/**
 * Watchlist service — personal title tracking business logic.
 */
export class WatchlistService {
  constructor(private readonly repository: WatchlistRepository) {}

  async create(userId: string, data: CreateWatchlistItemData): Promise<WatchlistItem> {
    try {
      return await this.repository.create(userId, data);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictError('Title is already on the watchlist');
      }
      throw error;
    }
  }

  async getById(userId: string, id: string): Promise<WatchlistItem> {
    const item = await this.repository.findByIdForUser(id, userId);
    if (!item) {
      throw new NotFoundError('Watchlist item not found');
    }
    return item;
  }

  async list(
    userId: string,
    filters: WatchlistListFilters,
    page: number,
    limit: number,
  ): Promise<PaginatedData<WatchlistItem>> {
    const { items, total } = await this.repository.listForUser(userId, filters, page, limit);
    return paginated(items, page, limit, total);
  }

  async update(userId: string, id: string, data: UpdateWatchlistItemData): Promise<WatchlistItem> {
    const item = await this.repository.updateByIdForUser(id, userId, data);
    if (!item) {
      throw new NotFoundError('Watchlist item not found');
    }
    return item;
  }

  async remove(userId: string, id: string): Promise<void> {
    const deleted = await this.repository.deleteByIdForUser(id, userId);
    if (!deleted) {
      throw new NotFoundError('Watchlist item not found');
    }
  }
}

export const createWatchlistService = (repository: WatchlistRepository): WatchlistService =>
  new WatchlistService(repository);
