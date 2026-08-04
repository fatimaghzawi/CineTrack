import { ConflictError, NotFoundError } from '@common/errors';
import type { PaginatedData } from '@common/types/api';
import { paginated } from '@common/utils/response';

import type { CollectionsRepository } from './collections.repository';
import type {
  AddCollectionItemData,
  Collection,
  CollectionListFilters,
  CreateCollectionData,
  UpdateCollectionData,
} from './collections.types';

function isDuplicateKeyError(error: unknown): boolean {
  return Boolean(
    error &&
    typeof error === 'object' &&
    'code' in error &&
    (error as { code: number }).code === 11000,
  );
}

export class CollectionsService {
  constructor(private readonly repository: CollectionsRepository) {}

  async create(userId: string, data: CreateCollectionData): Promise<Collection> {
    try {
      return await this.repository.create(userId, data);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictError('A collection with this name already exists');
      }
      throw error;
    }
  }

  async getById(userId: string, id: string): Promise<Collection> {
    const collection = await this.repository.findByIdForUser(id, userId);
    if (!collection) {
      throw new NotFoundError('Collection not found');
    }
    return collection;
  }

  async list(
    userId: string,
    filters: CollectionListFilters,
    page: number,
    limit: number,
  ): Promise<PaginatedData<Collection>> {
    const { items, total } = await this.repository.listForUser(userId, filters, page, limit);
    return paginated(items, page, limit, total);
  }

  async update(userId: string, id: string, data: UpdateCollectionData): Promise<Collection> {
    try {
      const collection = await this.repository.updateByIdForUser(id, userId, data);
      if (!collection) {
        throw new NotFoundError('Collection not found');
      }
      return collection;
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictError('A collection with this name already exists');
      }
      throw error;
    }
  }

  async remove(userId: string, id: string): Promise<void> {
    const deleted = await this.repository.deleteByIdForUser(id, userId);
    if (!deleted) {
      throw new NotFoundError('Collection not found');
    }
  }

  async addItem(userId: string, id: string, data: AddCollectionItemData): Promise<Collection> {
    const already = await this.repository.hasItem(id, userId, data.tmdbId, data.mediaType);
    if (already === null) {
      throw new NotFoundError('Collection not found');
    }
    if (already) {
      throw new ConflictError('Title is already in this collection');
    }

    const collection = await this.repository.addItemForUser(id, userId, data);
    if (!collection) {
      throw new NotFoundError('Collection not found');
    }
    return collection;
  }

  async removeItem(
    userId: string,
    id: string,
    tmdbId: number,
    mediaType: string,
  ): Promise<Collection> {
    const exists = await this.repository.hasItem(id, userId, tmdbId, mediaType);
    if (exists === null) {
      throw new NotFoundError('Collection not found');
    }
    if (!exists) {
      throw new NotFoundError('Title is not in this collection');
    }

    const collection = await this.repository.removeItemForUser(id, userId, tmdbId, mediaType);
    if (!collection) {
      throw new NotFoundError('Collection not found');
    }
    return collection;
  }
}

export const createCollectionsService = (repository: CollectionsRepository): CollectionsService =>
  new CollectionsService(repository);
