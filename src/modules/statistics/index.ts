/**
 * Statistics module public barrel.
 */

export { default as statisticsRoutes } from './statistics.routes';
export { StatisticsService, createStatisticsService } from './statistics.service';
export { StatisticsRepository, statisticsRepository } from './statistics.repository';
export { StatisticsController, createStatisticsController } from './statistics.controller';
export { StatisticsModel } from './statistics.model';
export type {
  StatisticsSnapshot,
  StatisticsTotals,
  StatisticsByMediaType,
  StatisticsRatingsSummary,
  StatisticsComputeResult,
} from './statistics.types';
export { statisticsQuerySchema } from './statistics.schema';
export type { StatisticsQuery } from './statistics.schema';
