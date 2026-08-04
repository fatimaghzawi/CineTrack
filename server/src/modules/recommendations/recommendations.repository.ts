import type { RecommendationDocument } from './recommendations.model';
import { RecommendationModel } from './recommendations.model';
import type {
  RecommendationCache,
  RecommendationItem,
  RecommendationSource,
} from './recommendations.types';

function toCache(doc: RecommendationDocument): RecommendationCache {
  const raw = doc.toObject() as unknown as {
    _id: unknown;
    user: unknown;
    source: RecommendationSource;
    items?: Array<{
      tmdbId: number;
      mediaType: RecommendationItem['mediaType'];
      score?: number | null;
      reason?: string;
    }>;
    generatedAt: Date;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
  };

  return {
    id: String(raw._id),
    userId: String(raw.user),
    source: raw.source,
    items: (raw.items ?? []).map((item) => ({
      tmdbId: item.tmdbId,
      mediaType: item.mediaType,
      score: item.score ?? null,
      reason: item.reason ?? '',
    })),
    generatedAt: raw.generatedAt,
    expiresAt: raw.expiresAt,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export type UpsertRecommendationData = {
  userId: string;
  source: RecommendationSource;
  items: RecommendationItem[];
  generatedAt: Date;
  expiresAt: Date;
};

/**
 * Recommendations repository — cache persistence only.
 */
export class RecommendationsRepository {
  isReady(): boolean {
    return true;
  }

  async findByUserId(userId: string): Promise<RecommendationCache | null> {
    const doc = await RecommendationModel.findOne({ user: userId });
    return doc ? toCache(doc) : null;
  }

  async upsertForUser(data: UpsertRecommendationData): Promise<RecommendationCache> {
    const doc = await RecommendationModel.findOneAndUpdate(
      { user: data.userId },
      {
        user: data.userId,
        source: data.source,
        items: data.items,
        generatedAt: data.generatedAt,
        expiresAt: data.expiresAt,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    if (!doc) {
      throw new Error('Failed to upsert recommendation cache');
    }

    return toCache(doc);
  }
}

export const recommendationsRepository = new RecommendationsRepository();
