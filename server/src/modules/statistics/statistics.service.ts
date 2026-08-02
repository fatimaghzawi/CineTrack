import type { StatisticsRepository } from './statistics.repository';
import type { StatisticsSnapshot } from './statistics.types';

/**
 * Statistics service — derived personal viewing snapshot.
 * Source of truth remains watchlist/favorites/ratings/journal/collections.
 */
export class StatisticsService {
  constructor(private readonly repository: StatisticsRepository) {}

  async getForUser(userId: string, refresh = false): Promise<StatisticsSnapshot> {
    if (!refresh) {
      const cached = await this.repository.findByUserId(userId);
      if (cached) {
        return cached;
      }
    }

    const computed = await this.repository.computeForUser(userId);
    return this.repository.upsertForUser(computed);
  }
}

export const createStatisticsService = (repository: StatisticsRepository): StatisticsService =>
  new StatisticsService(repository);
