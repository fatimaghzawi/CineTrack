import type { TmdbRepository } from './tmdb.repository';
import type { TmdbDiscoverParams, TmdbSearchParams, TmdbTrendingParams } from './tmdb.types';

/**
 * TMDb service — thin orchestration over the TMDb client.
 */
export class TmdbService {
  constructor(private readonly repository: TmdbRepository) {}

  search(params: TmdbSearchParams): Promise<unknown> {
    return this.repository.searchMulti(params);
  }

  getMovie(id: number): Promise<unknown> {
    return this.repository.getMovie(id);
  }

  getTv(id: number): Promise<unknown> {
    return this.repository.getTv(id);
  }

  getTrending(params: TmdbTrendingParams): Promise<unknown> {
    return this.repository.getTrending(params);
  }

  discoverMovies(params: TmdbDiscoverParams): Promise<unknown> {
    return this.repository.discoverMovies(params);
  }

  discoverTv(params: TmdbDiscoverParams): Promise<unknown> {
    return this.repository.discoverTv(params);
  }
}

export const createTmdbService = (repository: TmdbRepository): TmdbService =>
  new TmdbService(repository);
