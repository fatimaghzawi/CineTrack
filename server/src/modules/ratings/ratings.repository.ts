import type { RatingDocument } from './ratings.model';
import { RatingModel } from './ratings.model';
import type {
  CreateRatingData,
  RatingItem,
  RatingListFilters,
  UpdateRatingData,
} from './ratings.types';

function toRatingItem(doc: RatingDocument): RatingItem {
  const raw = doc.toObject() as unknown as {
    _id: unknown;
    user: unknown;
    tmdbId: number;
    mediaType: RatingItem['mediaType'];
    score: number;
    review?: string;
    createdAt: Date;
    updatedAt: Date;
  };

  return {
    id: String(raw._id),
    userId: String(raw.user),
    tmdbId: raw.tmdbId,
    mediaType: raw.mediaType,
    score: raw.score,
    review: raw.review ?? '',
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

/**
 * Ratings repository — database access only.
 */
export class RatingsRepository {
  isReady(): boolean {
    return true;
  }

  async create(userId: string, data: CreateRatingData): Promise<RatingItem> {
    const doc = await RatingModel.create({
      user: userId,
      tmdbId: data.tmdbId,
      mediaType: data.mediaType,
      score: data.score,
      review: data.review ?? '',
    });
    return toRatingItem(doc);
  }

  async findByIdForUser(id: string, userId: string): Promise<RatingItem | null> {
    const doc = await RatingModel.findOne({ _id: id, user: userId });
    return doc ? toRatingItem(doc) : null;
  }

  async listForUser(
    userId: string,
    filters: RatingListFilters,
    page: number,
    limit: number,
  ): Promise<{ items: RatingItem[]; total: number }> {
    const query: Record<string, unknown> = { user: userId };

    if (filters.mediaType !== undefined) query.mediaType = filters.mediaType;
    if (filters.minScore !== undefined || filters.maxScore !== undefined) {
      const score: Record<string, number> = {};
      if (filters.minScore !== undefined) score.$gte = filters.minScore;
      if (filters.maxScore !== undefined) score.$lte = filters.maxScore;
      query.score = score;
    }

    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      RatingModel.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit),
      RatingModel.countDocuments(query),
    ]);

    return { items: docs.map(toRatingItem), total };
  }

  async updateByIdForUser(
    id: string,
    userId: string,
    data: UpdateRatingData,
  ): Promise<RatingItem | null> {
    const update: Record<string, unknown> = {};
    if (data.score !== undefined) update.score = data.score;
    if (data.review !== undefined) update.review = data.review;

    const doc = await RatingModel.findOneAndUpdate({ _id: id, user: userId }, update, {
      new: true,
      runValidators: true,
    });

    return doc ? toRatingItem(doc) : null;
  }

  async deleteByIdForUser(id: string, userId: string): Promise<boolean> {
    const result = await RatingModel.findOneAndDelete({ _id: id, user: userId });
    return result !== null;
  }

  async listHighRatedRefsForUser(
    userId: string,
    minScore = 7,
  ): Promise<Array<{ tmdbId: number; mediaType: string; score: number }>> {
    const docs = await RatingModel.find({ user: userId, score: { $gte: minScore } })
      .select('tmdbId mediaType score')
      .lean();
    return (docs as unknown as Array<{ tmdbId: number; mediaType: string; score: number }>).map(
      (doc) => ({
        tmdbId: doc.tmdbId,
        mediaType: doc.mediaType,
        score: doc.score,
      }),
    );
  }
}

export const ratingsRepository = new RatingsRepository();
