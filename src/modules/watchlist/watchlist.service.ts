import type { WatchlistRepository } from './watchlist.repository';

/**
 * Watchlist service — business logic orchestration.
 */
export class WatchlistService {
  constructor(private readonly repository: WatchlistRepository) {}

  getScaffoldStatus() {
    return {
      module: 'watchlist' as const,
      status: 'scaffold' as const,
      persistence: this.repository.isReady(),
    };
  }
}

export const createWatchlistService = (repository: WatchlistRepository): WatchlistService =>
  new WatchlistService(repository);
