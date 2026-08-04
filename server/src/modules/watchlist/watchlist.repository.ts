import { WatchStatus } from '@common/constants/enums';

import type { WatchlistDocument } from './watchlist.model';
import { WatchlistModel } from './watchlist.model';
import type {
  CreateWatchlistItemData,
  UpdateWatchlistItemData,
  WatchlistItem,
  WatchlistListFilters,
  WatchProgress,
} from './watchlist.types';

function toWatchlistItem(doc: WatchlistDocument): WatchlistItem {
  const raw = doc.toObject() as unknown as {
    _id: unknown;
    user: unknown;
    tmdbId: number;
    mediaType: WatchlistItem['mediaType'];
    status: WatchlistItem['status'];
    progress?: WatchProgress;
    notes?: string;
    completedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };

  return {
    id: String(raw._id),
    userId: String(raw.user),
    tmdbId: raw.tmdbId,
    mediaType: raw.mediaType,
    status: raw.status,
    progress: raw.progress ?? {},
    notes: raw.notes ?? '',
    completedAt: raw.completedAt ?? null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

/**
 * Watchlist repository — database access only.
 */
export class WatchlistRepository {
  isReady(): boolean {
    return true;
  }

  async create(userId: string, data: CreateWatchlistItemData): Promise<WatchlistItem> {
    const status = data.status ?? WatchStatus.PLAN_TO_WATCH;
    const doc = await WatchlistModel.create({
      user: userId,
      tmdbId: data.tmdbId,
      mediaType: data.mediaType,
      status,
      progress: data.progress ?? {},
      notes: data.notes ?? '',
      completedAt: status === WatchStatus.COMPLETED ? new Date() : null,
    });

    return toWatchlistItem(doc);
  }

  async findByIdForUser(id: string, userId: string): Promise<WatchlistItem | null> {
    const doc = await WatchlistModel.findOne({ _id: id, user: userId });
    return doc ? toWatchlistItem(doc) : null;
  }

  async findByRefForUser(
    userId: string,
    tmdbId: number,
    mediaType: string,
  ): Promise<WatchlistItem | null> {
    const doc = await WatchlistModel.findOne({ user: userId, tmdbId, mediaType });
    return doc ? toWatchlistItem(doc) : null;
  }

  async listForUser(
    userId: string,
    filters: WatchlistListFilters,
    page: number,
    limit: number,
  ): Promise<{ items: WatchlistItem[]; total: number }> {
    const query: Record<string, unknown> = { user: userId };

    if (filters.status !== undefined) query.status = filters.status;
    if (filters.mediaType !== undefined) query.mediaType = filters.mediaType;

    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      WatchlistModel.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit),
      WatchlistModel.countDocuments(query),
    ]);

    return { items: docs.map(toWatchlistItem), total };
  }

  async updateByIdForUser(
    id: string,
    userId: string,
    data: UpdateWatchlistItemData,
  ): Promise<WatchlistItem | null> {
    const update: Record<string, unknown> = {};

    if (data.status !== undefined) {
      update.status = data.status;
      update.completedAt = data.status === WatchStatus.COMPLETED ? new Date() : null;
    }
    if (data.progress !== undefined) update.progress = data.progress;
    if (data.notes !== undefined) update.notes = data.notes;

    const doc = await WatchlistModel.findOneAndUpdate({ _id: id, user: userId }, update, {
      new: true,
      runValidators: true,
    });

    return doc ? toWatchlistItem(doc) : null;
  }

  async deleteByIdForUser(id: string, userId: string): Promise<boolean> {
    const result = await WatchlistModel.findOneAndDelete({ _id: id, user: userId });
    return result !== null;
  }

  async listRefsForUser(userId: string): Promise<Array<{ tmdbId: number; mediaType: string }>> {
    const docs = await WatchlistModel.find({ user: userId }).select('tmdbId mediaType').lean();
    return (docs as unknown as Array<{ tmdbId: number; mediaType: string }>).map((doc) => ({
      tmdbId: doc.tmdbId,
      mediaType: doc.mediaType,
    }));
  }
}

export const watchlistRepository = new WatchlistRepository();
