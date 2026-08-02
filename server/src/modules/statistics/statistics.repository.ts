import { Types } from 'mongoose';

import { MediaType, WatchStatus } from '@common/constants/enums';
import { CollectionModel } from '@modules/collections/collections.model';
import { FavoriteModel } from '@modules/favorites/favorites.model';
import { JournalModel } from '@modules/journal/journal.model';
import { RatingModel } from '@modules/ratings/ratings.model';
import { WatchlistModel } from '@modules/watchlist/watchlist.model';

import type { StatisticsDocument } from './statistics.model';
import { StatisticsModel } from './statistics.model';
import type {
  StatisticsByMediaType,
  StatisticsComputeResult,
  StatisticsRatingsSummary,
  StatisticsSnapshot,
  StatisticsTotals,
} from './statistics.types';

function toObjectId(userId: string): Types.ObjectId {
  return new Types.ObjectId(userId);
}

function emptyTotals(): StatisticsTotals {
  return {
    watchlist: 0,
    completed: 0,
    watching: 0,
    planToWatch: 0,
    dropped: 0,
    favorites: 0,
    ratings: 0,
    journalEntries: 0,
    collections: 0,
  };
}

function emptyByMediaType(): StatisticsByMediaType {
  return { movie: 0, tv: 0 };
}

function emptyRatingsSummary(): StatisticsRatingsSummary {
  return {
    averageScore: null,
    highestScore: null,
    lowestScore: null,
  };
}

function toSnapshot(doc: StatisticsDocument): StatisticsSnapshot {
  const raw = doc.toObject() as unknown as {
    _id: unknown;
    user: unknown;
    totals: StatisticsTotals;
    byMediaType: StatisticsByMediaType;
    ratings: StatisticsRatingsSummary;
    lastComputedAt: Date;
    createdAt: Date;
    updatedAt: Date;
  };

  return {
    id: String(raw._id),
    userId: String(raw.user),
    totals: {
      watchlist: raw.totals.watchlist,
      completed: raw.totals.completed,
      watching: raw.totals.watching,
      planToWatch: raw.totals.planToWatch,
      dropped: raw.totals.dropped,
      favorites: raw.totals.favorites,
      ratings: raw.totals.ratings,
      journalEntries: raw.totals.journalEntries,
      collections: raw.totals.collections,
    },
    byMediaType: {
      movie: raw.byMediaType.movie,
      tv: raw.byMediaType.tv,
    },
    ratings: {
      averageScore: raw.ratings.averageScore ?? null,
      highestScore: raw.ratings.highestScore ?? null,
      lowestScore: raw.ratings.lowestScore ?? null,
    },
    lastComputedAt: raw.lastComputedAt,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

/**
 * Statistics repository — database access only.
 * Reads source collections and persists the derived snapshot cache.
 */
export class StatisticsRepository {
  isReady(): boolean {
    return true;
  }

  async findByUserId(userId: string): Promise<StatisticsSnapshot | null> {
    const doc = await StatisticsModel.findOne({ user: userId });
    return doc ? toSnapshot(doc) : null;
  }

  async upsertForUser(data: StatisticsComputeResult): Promise<StatisticsSnapshot> {
    const doc = await StatisticsModel.findOneAndUpdate(
      { user: data.userId },
      {
        user: data.userId,
        totals: data.totals,
        byMediaType: data.byMediaType,
        ratings: data.ratings,
        lastComputedAt: data.lastComputedAt,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    if (!doc) {
      throw new Error('Failed to upsert statistics snapshot');
    }

    return toSnapshot(doc);
  }

  async computeForUser(userId: string): Promise<StatisticsComputeResult> {
    const userObjectId = toObjectId(userId);

    const [
      watchlistTotal,
      statusCounts,
      mediaTypeCounts,
      favorites,
      ratingsCount,
      journalEntries,
      collections,
      ratingsSummary,
    ] = await Promise.all([
      WatchlistModel.countDocuments({ user: userObjectId }),
      WatchlistModel.aggregate<{ _id: string; count: number }>([
        { $match: { user: userObjectId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      WatchlistModel.aggregate<{ _id: string; count: number }>([
        { $match: { user: userObjectId } },
        { $group: { _id: '$mediaType', count: { $sum: 1 } } },
      ]),
      FavoriteModel.countDocuments({ user: userObjectId }),
      RatingModel.countDocuments({ user: userObjectId }),
      JournalModel.countDocuments({ user: userObjectId }),
      CollectionModel.countDocuments({ user: userObjectId }),
      RatingModel.aggregate<{
        averageScore: number | null;
        highestScore: number | null;
        lowestScore: number | null;
      }>([
        { $match: { user: userObjectId } },
        {
          $group: {
            _id: null,
            averageScore: { $avg: '$score' },
            highestScore: { $max: '$score' },
            lowestScore: { $min: '$score' },
          },
        },
      ]),
    ]);

    const totals = emptyTotals();
    totals.watchlist = watchlistTotal;
    totals.favorites = favorites;
    totals.ratings = ratingsCount;
    totals.journalEntries = journalEntries;
    totals.collections = collections;

    for (const row of statusCounts) {
      switch (row._id) {
        case WatchStatus.COMPLETED:
          totals.completed = row.count;
          break;
        case WatchStatus.WATCHING:
          totals.watching = row.count;
          break;
        case WatchStatus.PLAN_TO_WATCH:
          totals.planToWatch = row.count;
          break;
        case WatchStatus.DROPPED:
          totals.dropped = row.count;
          break;
        default:
          break;
      }
    }

    const byMediaType = emptyByMediaType();
    for (const row of mediaTypeCounts) {
      if (row._id === MediaType.MOVIE) byMediaType.movie = row.count;
      if (row._id === MediaType.TV) byMediaType.tv = row.count;
    }

    const ratings = emptyRatingsSummary();
    const summaryRow = ratingsSummary[0];
    if (summaryRow) {
      ratings.averageScore =
        summaryRow.averageScore === null ? null : Math.round(summaryRow.averageScore * 100) / 100;
      ratings.highestScore = summaryRow.highestScore;
      ratings.lowestScore = summaryRow.lowestScore;
    }

    return {
      userId,
      totals,
      byMediaType,
      ratings,
      lastComputedAt: new Date(),
    };
  }
}

export const statisticsRepository = new StatisticsRepository();
