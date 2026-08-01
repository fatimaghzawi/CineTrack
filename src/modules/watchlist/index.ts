/**
 * Watchlist module public barrel.
 */

export { default as watchlistRoutes } from './watchlist.routes';
export { WatchlistService, createWatchlistService } from './watchlist.service';
export { WatchlistRepository, watchlistRepository } from './watchlist.repository';
export { WatchlistController, createWatchlistController } from './watchlist.controller';
export { WatchlistModel } from './watchlist.model';
export type {
  WatchlistItem,
  WatchProgress,
  CreateWatchlistItemData,
  UpdateWatchlistItemData,
  WatchlistListFilters,
} from './watchlist.types';
export {
  createWatchlistItemSchema,
  updateWatchlistItemSchema,
  watchlistIdParamsSchema,
  listWatchlistQuerySchema,
  watchProgressSchema,
} from './watchlist.schema';
export type {
  CreateWatchlistItemInput,
  UpdateWatchlistItemInput,
  WatchlistIdParams,
  ListWatchlistQuery,
} from './watchlist.schema';
