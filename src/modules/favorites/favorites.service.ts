import type { FavoritesRepository } from './favorites.repository';

export class FavoritesService {
  constructor(private readonly repository: FavoritesRepository) {}

  getScaffoldStatus() {
    return {
      module: 'favorites' as const,
      status: 'scaffold' as const,
      persistence: this.repository.isReady(),
    };
  }
}

export const createFavoritesService = (repository: FavoritesRepository): FavoritesService =>
  new FavoritesService(repository);
