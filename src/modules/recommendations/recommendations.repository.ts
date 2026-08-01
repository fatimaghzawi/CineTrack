/**
 * Recommendations repository — database access only.
 * No HTTP concerns and no business rules.
 */

export class RecommendationsRepository {
  isReady(): boolean {
    return true;
  }

  // Persistence methods will be added during implementation.
}

export const recommendationsRepository = new RecommendationsRepository();
