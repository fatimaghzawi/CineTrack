/**
 * Recommendations module public barrel.
 */

export { default as recommendationsRoutes } from './recommendations.routes';
export { RecommendationsService, createRecommendationsService } from './recommendations.service';
export { RecommendationsRepository, recommendationsRepository } from './recommendations.repository';
export {
  RecommendationsController,
  createRecommendationsController,
} from './recommendations.controller';
export { RecommendationModel } from './recommendations.model';
export type {
  RecommendationCache,
  RecommendationItem,
  RecommendationSource,
  RecommendationListFilters,
} from './recommendations.types';
export { recommendationsQuerySchema } from './recommendations.schema';
export type { RecommendationsQuery } from './recommendations.schema';
