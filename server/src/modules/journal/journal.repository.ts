import type { JournalDocument } from './journal.model';
import { JournalModel } from './journal.model';
import type {
  CreateJournalEntryData,
  JournalEntry,
  JournalListFilters,
  UpdateJournalEntryData,
} from './journal.types';

function toJournalEntry(doc: JournalDocument): JournalEntry {
  const raw = doc.toObject() as unknown as {
    _id: unknown;
    user: unknown;
    tmdbId: number;
    mediaType: JournalEntry['mediaType'];
    title?: string;
    body: string;
    watchedAt?: Date | null;
    mood?: string;
    isSpoiler?: boolean;
    createdAt: Date;
    updatedAt: Date;
  };

  return {
    id: String(raw._id),
    userId: String(raw.user),
    tmdbId: raw.tmdbId,
    mediaType: raw.mediaType,
    title: raw.title ?? '',
    body: raw.body,
    watchedAt: raw.watchedAt ?? null,
    mood: raw.mood ?? '',
    isSpoiler: raw.isSpoiler ?? false,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

/**
 * Journal repository — database access only.
 * No HTTP concerns and no business rules.
 */
export class JournalRepository {
  isReady(): boolean {
    return true;
  }

  async create(userId: string, data: CreateJournalEntryData): Promise<JournalEntry> {
    const doc = await JournalModel.create({
      user: userId,
      tmdbId: data.tmdbId,
      mediaType: data.mediaType,
      title: data.title ?? '',
      body: data.body,
      watchedAt: data.watchedAt ?? null,
      mood: data.mood ?? '',
      isSpoiler: data.isSpoiler ?? false,
    });

    return toJournalEntry(doc);
  }

  async findByIdForUser(id: string, userId: string): Promise<JournalEntry | null> {
    const doc = await JournalModel.findOne({ _id: id, user: userId });
    return doc ? toJournalEntry(doc) : null;
  }

  async listForUser(
    userId: string,
    filters: JournalListFilters,
    page: number,
    limit: number,
  ): Promise<{ items: JournalEntry[]; total: number }> {
    const query: Record<string, unknown> = { user: userId };

    if (filters.mediaType !== undefined) {
      query.mediaType = filters.mediaType;
    }
    if (filters.tmdbId !== undefined) {
      query.tmdbId = filters.tmdbId;
    }

    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      JournalModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      JournalModel.countDocuments(query),
    ]);

    return {
      items: docs.map(toJournalEntry),
      total,
    };
  }

  async updateByIdForUser(
    id: string,
    userId: string,
    data: UpdateJournalEntryData,
  ): Promise<JournalEntry | null> {
    const update: Record<string, unknown> = {};

    if (data.title !== undefined) update.title = data.title;
    if (data.body !== undefined) update.body = data.body;
    if (data.watchedAt !== undefined) update.watchedAt = data.watchedAt;
    if (data.mood !== undefined) update.mood = data.mood;
    if (data.isSpoiler !== undefined) update.isSpoiler = data.isSpoiler;

    const doc = await JournalModel.findOneAndUpdate({ _id: id, user: userId }, update, {
      new: true,
      runValidators: true,
    });

    return doc ? toJournalEntry(doc) : null;
  }

  async deleteByIdForUser(id: string, userId: string): Promise<boolean> {
    const result = await JournalModel.findOneAndDelete({ _id: id, user: userId });
    return result !== null;
  }

  async countForUser(userId: string): Promise<number> {
    return JournalModel.countDocuments({ user: userId });
  }
}

export const journalRepository = new JournalRepository();
