/**
 * Ratings module public barrel.
 */

export { default as ratingsRoutes } from './ratings.routes';
export { RatingsService, createRatingsService } from './ratings.service';
export { RatingsRepository, ratingsRepository } from './ratings.repository';
export { RatingsController, createRatingsController } from './ratings.controller';
export { RatingModel } from './ratings.model';
export type {
  RatingItem,
  CreateRatingData,
  UpdateRatingData,
  RatingListFilters,
} from './ratings.types';
export {
  createRatingSchema,
  updateRatingSchema,
  ratingIdParamsSchema,
  listRatingsQuerySchema,
  ratingScoreSchema,
} from './ratings.schema';
export type {
  CreateRatingInput,
  UpdateRatingInput,
  RatingIdParams,
  ListRatingsQuery,
} from './ratings.schema';
