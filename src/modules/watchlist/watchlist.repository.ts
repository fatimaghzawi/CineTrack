/**
 * Watchlist repository — database access only.
 * No HTTP concerns and no business rules.
 */

export class WatchlistRepository {
  isReady(): boolean {
    return true;
  }

  // Persistence methods will be added during implementation.
}

export const watchlistRepository = new WatchlistRepository();
