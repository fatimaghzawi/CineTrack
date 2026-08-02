import type { RatingsRepository } from './ratings.repository';

export class RatingsService {
  constructor(private readonly repository: RatingsRepository) {}

  getScaffoldStatus() {
    return {
      module: 'ratings' as const,
      status: 'scaffold' as const,
      persistence: this.repository.isReady(),
    };
  }
}

export const createRatingsService = (repository: RatingsRepository): RatingsService =>
  new RatingsService(repository);
