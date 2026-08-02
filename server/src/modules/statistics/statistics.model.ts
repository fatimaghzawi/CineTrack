import { Schema, model, type HydratedDocument, type InferSchemaType, type Model } from 'mongoose';

import { defaultSchemaOptions, userRefField } from '@common/utils/mongoose';

/**
 * Cached personal statistics snapshot.
 * Source of truth remains watchlist/favorites/ratings/journal/collections;
 * this document is an optional derived cache for faster reads.
 */
const statisticsSchema = new Schema(
  {
    user: {
      ...userRefField,
      unique: true,
    },
    totals: {
      watchlist: { type: Number, default: 0, min: 0 },
      completed: { type: Number, default: 0, min: 0 },
      watching: { type: Number, default: 0, min: 0 },
      planToWatch: { type: Number, default: 0, min: 0 },
      dropped: { type: Number, default: 0, min: 0 },
      favorites: { type: Number, default: 0, min: 0 },
      ratings: { type: Number, default: 0, min: 0 },
      journalEntries: { type: Number, default: 0, min: 0 },
      collections: { type: Number, default: 0, min: 0 },
    },
    byMediaType: {
      movie: { type: Number, default: 0, min: 0 },
      tv: { type: Number, default: 0, min: 0 },
    },
    ratings: {
      averageScore: { type: Number, default: null, min: 0, max: 10 },
      highestScore: { type: Number, default: null, min: 0, max: 10 },
      lowestScore: { type: Number, default: null, min: 0, max: 10 },
    },
    lastComputedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  defaultSchemaOptions,
);

statisticsSchema.index({ lastComputedAt: -1 });

export type StatisticsDocument = HydratedDocument<InferSchemaType<typeof statisticsSchema>>;
export type StatisticsModelType = Model<InferSchemaType<typeof statisticsSchema>>;

export const StatisticsModel = model('StatisticsSnapshot', statisticsSchema);
