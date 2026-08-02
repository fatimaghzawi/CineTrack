import type { FavoriteDocument } from './favorites.model';
import { FavoriteModel } from './favorites.model';
import type { CreateFavoriteData, FavoriteItem, FavoriteListFilters } from './favorites.types';

function toFavoriteItem(doc: FavoriteDocument): FavoriteItem {
  const raw = doc.toObject() as unknown as {
    _id: unknown;
    user: unknown;
    tmdbId: number;
    mediaType: FavoriteItem['mediaType'];
    createdAt: Date;
    updatedAt: Date;
  };

  return {
    id: String(raw._id),
    userId: String(raw.user),
    tmdbId: raw.tmdbId,
    mediaType: raw.mediaType,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

/**
 * Favorites repository — database access only.
 */
export class FavoritesRepository {
  isReady(): boolean {
    return true;
  }

  async create(userId: string, data: CreateFavoriteData): Promise<FavoriteItem> {
    const doc = await FavoriteModel.create({
      user: userId,
      tmdbId: data.tmdbId,
      mediaType: data.mediaType,
    });
    return toFavoriteItem(doc);
  }

  async findByIdForUser(id: string, userId: string): Promise<FavoriteItem | null> {
    const doc = await FavoriteModel.findOne({ _id: id, user: userId });
    return doc ? toFavoriteItem(doc) : null;
  }

  async listForUser(
    userId: string,
    filters: FavoriteListFilters,
    page: number,
    limit: number,
  ): Promise<{ items: FavoriteItem[]; total: number }> {
    const query: Record<string, unknown> = { user: userId };
    if (filters.mediaType !== undefined) query.mediaType = filters.mediaType;

    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      FavoriteModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      FavoriteModel.countDocuments(query),
    ]);

    return { items: docs.map(toFavoriteItem), total };
  }

  async deleteByIdForUser(id: string, userId: string): Promise<boolean> {
    const result = await FavoriteModel.findOneAndDelete({ _id: id, user: userId });
    return result !== null;
  }

  async deleteByRefForUser(userId: string, tmdbId: number, mediaType: string): Promise<boolean> {
    const result = await FavoriteModel.findOneAndDelete({ user: userId, tmdbId, mediaType });
    return result !== null;
  }

  async listRefsForUser(userId: string): Promise<Array<{ tmdbId: number; mediaType: string }>> {
    const docs = await FavoriteModel.find({ user: userId }).select('tmdbId mediaType').lean();
    return (docs as unknown as Array<{ tmdbId: number; mediaType: string }>).map((doc) => ({
      tmdbId: doc.tmdbId,
      mediaType: doc.mediaType,
    }));
  }
}

export const favoritesRepository = new FavoritesRepository();
