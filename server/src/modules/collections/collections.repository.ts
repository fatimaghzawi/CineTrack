import type { MediaType } from '@common/constants/enums';

import type { CollectionDocument } from './collections.model';
import { CollectionModel } from './collections.model';
import type {
  AddCollectionItemData,
  Collection,
  CollectionItem,
  CollectionListFilters,
  CreateCollectionData,
  UpdateCollectionData,
} from './collections.types';

function toCollection(doc: CollectionDocument): Collection {
  const raw = doc.toObject() as unknown as {
    _id: unknown;
    user: unknown;
    name: string;
    description?: string;
    isPublic?: boolean;
    coverTmdbId?: number | null;
    coverMediaType?: MediaType | null;
    items?: Array<{
      tmdbId: number;
      mediaType: MediaType;
      note?: string;
      addedAt?: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
  };

  const items: CollectionItem[] = (raw.items ?? []).map((item) => ({
    tmdbId: item.tmdbId,
    mediaType: item.mediaType,
    note: item.note ?? '',
    addedAt: item.addedAt ?? new Date(),
  }));

  return {
    id: String(raw._id),
    userId: String(raw.user),
    name: raw.name,
    description: raw.description ?? '',
    isPublic: raw.isPublic ?? false,
    coverTmdbId: raw.coverTmdbId ?? null,
    coverMediaType: raw.coverMediaType ?? null,
    items,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

/**
 * Collections repository — database access only.
 */
export class CollectionsRepository {
  isReady(): boolean {
    return true;
  }

  async create(userId: string, data: CreateCollectionData): Promise<Collection> {
    const doc = await CollectionModel.create({
      user: userId,
      name: data.name,
      description: data.description ?? '',
      isPublic: data.isPublic ?? false,
      items: [],
    });
    return toCollection(doc);
  }

  async findByIdForUser(id: string, userId: string): Promise<Collection | null> {
    const doc = await CollectionModel.findOne({ _id: id, user: userId });
    return doc ? toCollection(doc) : null;
  }

  async listForUser(
    userId: string,
    filters: CollectionListFilters,
    page: number,
    limit: number,
  ): Promise<{ items: Collection[]; total: number }> {
    const query: Record<string, unknown> = { user: userId };
    if (filters.isPublic !== undefined) query.isPublic = filters.isPublic;

    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      CollectionModel.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit),
      CollectionModel.countDocuments(query),
    ]);

    return { items: docs.map(toCollection), total };
  }

  async updateByIdForUser(
    id: string,
    userId: string,
    data: UpdateCollectionData,
  ): Promise<Collection | null> {
    const update: Record<string, unknown> = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.description !== undefined) update.description = data.description;
    if (data.isPublic !== undefined) update.isPublic = data.isPublic;
    if (data.coverTmdbId !== undefined) update.coverTmdbId = data.coverTmdbId;
    if (data.coverMediaType !== undefined) update.coverMediaType = data.coverMediaType;

    const doc = await CollectionModel.findOneAndUpdate({ _id: id, user: userId }, update, {
      new: true,
      runValidators: true,
    });

    return doc ? toCollection(doc) : null;
  }

  async deleteByIdForUser(id: string, userId: string): Promise<boolean> {
    const result = await CollectionModel.findOneAndDelete({ _id: id, user: userId });
    return result !== null;
  }

  async addItemForUser(
    id: string,
    userId: string,
    data: AddCollectionItemData,
  ): Promise<Collection | null> {
    const collection = await CollectionModel.findOne({ _id: id, user: userId });
    if (!collection) return null;

    const items = (collection.toObject() as unknown as { items?: CollectionItem[] }).items ?? [];
    const exists = items.some(
      (item) => item.tmdbId === data.tmdbId && item.mediaType === data.mediaType,
    );
    if (exists) {
      return toCollection(collection);
    }

    const doc = await CollectionModel.findOneAndUpdate(
      { _id: id, user: userId },
      {
        $push: {
          items: {
            tmdbId: data.tmdbId,
            mediaType: data.mediaType,
            note: data.note ?? '',
            addedAt: new Date(),
          },
        },
      },
      { new: true, runValidators: true },
    );

    return doc ? toCollection(doc) : null;
  }

  async removeItemForUser(
    id: string,
    userId: string,
    tmdbId: number,
    mediaType: string,
  ): Promise<Collection | null> {
    const doc = await CollectionModel.findOneAndUpdate(
      { _id: id, user: userId },
      { $pull: { items: { tmdbId, mediaType } } },
      { new: true },
    );

    return doc ? toCollection(doc) : null;
  }

  async hasItem(
    id: string,
    userId: string,
    tmdbId: number,
    mediaType: string,
  ): Promise<boolean | null> {
    const doc = await CollectionModel.findOne({ _id: id, user: userId }).select('items').lean();
    if (!doc) return null;
    const items = (doc as { items?: Array<{ tmdbId: number; mediaType: string }> }).items ?? [];
    return items.some((item) => item.tmdbId === tmdbId && item.mediaType === mediaType);
  }
}

export const collectionsRepository = new CollectionsRepository();
