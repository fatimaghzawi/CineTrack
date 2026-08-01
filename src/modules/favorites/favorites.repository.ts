/**
 * Favorites repository — database access only.
 * No HTTP concerns and no business rules.
 */

export class FavoritesRepository {
  isReady(): boolean {
    return true;
  }

  // Persistence methods will be added during implementation.
}

export const favoritesRepository = new FavoritesRepository();
