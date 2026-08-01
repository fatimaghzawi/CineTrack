import type { StatisticsRepository } from './statistics.repository';

export class StatisticsService {
  constructor(private readonly repository: StatisticsRepository) {}

  getScaffoldStatus() {
    return {
      module: 'statistics' as const,
      status: 'scaffold' as const,
      persistence: this.repository.isReady(),
    };
  }
}

export const createStatisticsService = (repository: StatisticsRepository): StatisticsService =>
  new StatisticsService(repository);
