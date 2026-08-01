/**
 * Statistics repository — database access only.
 * No HTTP concerns and no business rules.
 */

export class StatisticsRepository {
  isReady(): boolean {
    return true;
  }

  // Persistence methods will be added during implementation.
}

export const statisticsRepository = new StatisticsRepository();
