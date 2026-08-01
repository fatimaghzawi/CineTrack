/**
 * Favorites module public barrel.
 */

export { default as favoritesRoutes } from './favorites.routes';
export { FavoritesService, createFavoritesService } from './favorites.service';
export { FavoritesRepository, favoritesRepository } from './favorites.repository';
export { FavoritesController, createFavoritesController } from './favorites.controller';
export { FavoriteModel } from './favorites.model';
export type { FavoriteItem, CreateFavoriteData, FavoriteListFilters } from './favorites.types';
export {
  createFavoriteSchema,
  favoriteIdParamsSchema,
  favoriteRefParamsSchema,
  listFavoritesQuerySchema,
} from './favorites.schema';
export type {
  CreateFavoriteInput,
  FavoriteIdParams,
  FavoriteRefParams,
  ListFavoritesQuery,
} from './favorites.schema';
