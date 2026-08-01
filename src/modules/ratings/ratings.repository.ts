/**
 * Ratings repository — database access only.
 * No HTTP concerns and no business rules.
 */

export class RatingsRepository {
  isReady(): boolean {
    return true;
  }

  // Persistence methods will be added during implementation.
}

export const ratingsRepository = new RatingsRepository();
