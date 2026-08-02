import { ConflictError, NotFoundError } from '@common/errors';
import type { PaginatedData } from '@common/types/api';
import { paginated } from '@common/utils/response';

import type { RatingsRepository } from './ratings.repository';
import type {
  CreateRatingData,
  RatingItem,
  RatingListFilters,
  UpdateRatingData,
} from './ratings.types';

function isDuplicateKeyError(error: unknown): boolean {
  return Boolean(
    error &&
    typeof error === 'object' &&
    'code' in error &&
    (error as { code: number }).code === 11000,
  );
}

export class RatingsService {
  constructor(private readonly repository: RatingsRepository) {}

  async create(userId: string, data: CreateRatingData): Promise<RatingItem> {
    try {
      return await this.repository.create(userId, data);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictError('Title is already rated');
      }
      throw error;
    }
  }

  async getById(userId: string, id: string): Promise<RatingItem> {
    const rating = await this.repository.findByIdForUser(id, userId);
    if (!rating) {
      throw new NotFoundError('Rating not found');
    }
    return rating;
  }

  async list(
    userId: string,
    filters: RatingListFilters,
    page: number,
    limit: number,
  ): Promise<PaginatedData<RatingItem>> {
    const { items, total } = await this.repository.listForUser(userId, filters, page, limit);
    return paginated(items, page, limit, total);
  }

  async update(userId: string, id: string, data: UpdateRatingData): Promise<RatingItem> {
    const rating = await this.repository.updateByIdForUser(id, userId, data);
    if (!rating) {
      throw new NotFoundError('Rating not found');
    }
    return rating;
  }

  async remove(userId: string, id: string): Promise<void> {
    const deleted = await this.repository.deleteByIdForUser(id, userId);
    if (!deleted) {
      throw new NotFoundError('Rating not found');
    }
  }
}

export const createRatingsService = (repository: RatingsRepository): RatingsService =>
  new RatingsService(repository);
