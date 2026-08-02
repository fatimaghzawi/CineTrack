/**
 * TMDb module public barrel.
 */

export { default as tmdbRoutes } from './tmdb.routes';
export { TmdbService, createTmdbService } from './tmdb.service';
export { TmdbRepository, tmdbRepository } from './tmdb.repository';
export { TmdbController, createTmdbController } from './tmdb.controller';
export type {
  TmdbMediaType,
  TmdbSearchParams,
  TmdbDiscoverParams,
  TmdbTrendingParams,
} from './tmdb.types';
export {
  tmdbSearchQuerySchema,
  tmdbIdParamsSchema,
  tmdbTrendingQuerySchema,
  tmdbDiscoverQuerySchema,
} from './tmdb.schema';
