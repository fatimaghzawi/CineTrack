import { MediaType } from '@common/constants/enums';
import type { PaginatedData } from '@common/types/api';
import { buildPaginationMeta } from '@common/utils/response';
import { favoritesRepository } from '@modules/favorites/favorites.repository';
import { ratingsRepository } from '@modules/ratings/ratings.repository';
import { tmdbRepository } from '@modules/tmdb/tmdb.repository';
import { watchlistRepository } from '@modules/watchlist/watchlist.repository';

import type { RecommendationsRepository } from './recommendations.repository';
import type { RecommendationItem } from './recommendations.types';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const GENERATION_PAGE_SIZE = 40;

type TmdbListResult = {
  results?: Array<{
    id?: number;
    media_type?: string;
    popularity?: number;
  }>;
};

export type RecommendationsResult = PaginatedData<RecommendationItem> & {
  source: string;
  generatedAt: Date;
  expiresAt: Date;
};

function mediaKey(tmdbId: number, mediaType: string): string {
  return `${mediaType}:${tmdbId}`;
}

/**
 * Recommendations service — hybrid cache from user taste + TMDb trending.
 */
export class RecommendationsService {
  constructor(private readonly repository: RecommendationsRepository) {}

  async listForUser(
    userId: string,
    options: { page: number; limit: number; mediaType?: MediaType; refresh?: boolean },
  ): Promise<RecommendationsResult> {
    const refresh = options.refresh ?? false;
    let cache = await this.repository.findByUserId(userId);

    if (refresh || !cache || cache.expiresAt.getTime() <= Date.now()) {
      cache = await this.regenerate(userId);
    }

    let items = cache.items;
    if (options.mediaType) {
      items = items.filter((item) => item.mediaType === options.mediaType);
    }

    const skip = (options.page - 1) * options.limit;
    const sliced = items.slice(skip, skip + options.limit);

    return {
      items: sliced,
      pagination: buildPaginationMeta(options.page, options.limit, items.length),
      source: cache.source,
      generatedAt: cache.generatedAt,
      expiresAt: cache.expiresAt,
    };
  }

  private async regenerate(userId: string) {
    const [watchlistRefs, favoriteRefs, highRatings, trending] = await Promise.all([
      watchlistRepository.listRefsForUser(userId),
      favoritesRepository.listRefsForUser(userId),
      ratingsRepository.listHighRatedRefsForUser(userId),
      tmdbRepository.getTrending({
        mediaType: 'all',
        timeWindow: 'week',
        page: 1,
      }) as Promise<TmdbListResult>,
    ]);

    const excluded = new Set<string>();
    for (const ref of [...watchlistRefs, ...favoriteRefs, ...highRatings]) {
      excluded.add(mediaKey(ref.tmdbId, ref.mediaType));
    }

    const hasTasteSignal = favoriteRefs.length > 0 || highRatings.length > 0;
    const items: RecommendationItem[] = [];

    for (const result of trending.results ?? []) {
      if (items.length >= GENERATION_PAGE_SIZE) break;
      if (typeof result.id !== 'number') continue;

      const mediaType =
        result.media_type === 'tv'
          ? MediaType.TV
          : result.media_type === 'movie'
            ? MediaType.MOVIE
            : null;
      if (!mediaType) continue;
      if (excluded.has(mediaKey(result.id, mediaType))) continue;

      items.push({
        tmdbId: result.id,
        mediaType,
        score:
          typeof result.popularity === 'number'
            ? Math.min(100, Math.round(result.popularity))
            : null,
        reason: hasTasteSignal
          ? 'Trending title outside your watchlist and favorites'
          : 'Popular trending title to get you started',
      });
    }

    const now = new Date();
    return this.repository.upsertForUser({
      userId,
      source: hasTasteSignal ? 'hybrid' : 'tmdb',
      items,
      generatedAt: now,
      expiresAt: new Date(now.getTime() + CACHE_TTL_MS),
    });
  }
}

export const createRecommendationsService = (
  repository: RecommendationsRepository,
): RecommendationsService => new RecommendationsService(repository);
