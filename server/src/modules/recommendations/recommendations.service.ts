import type { RecommendationsRepository } from './recommendations.repository';

export class RecommendationsService {
  constructor(private readonly repository: RecommendationsRepository) {}

  getScaffoldStatus() {
    return {
      module: 'recommendations' as const,
      status: 'scaffold' as const,
      persistence: this.repository.isReady(),
    };
  }
}

export const createRecommendationsService = (
  repository: RecommendationsRepository,
): RecommendationsService => new RecommendationsService(repository);
