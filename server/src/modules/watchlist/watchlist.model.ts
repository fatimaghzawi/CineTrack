import { Schema, model, type HydratedDocument, type InferSchemaType, type Model } from 'mongoose';

import {
  defaultSchemaOptions,
  mediaTypeField,
  tmdbIdField,
  userRefField,
  watchStatusField,
} from '@common/utils/mongoose';

const watchProgressSchema = new Schema(
  {
    season: { type: Number, min: 0 },
    episode: { type: Number, min: 0 },
    percent: { type: Number, min: 0, max: 100 },
  },
  { _id: false },
);

const watchlistSchema = new Schema(
  {
    user: userRefField,
    tmdbId: tmdbIdField,
    mediaType: mediaTypeField,
    status: watchStatusField,
    progress: {
      type: watchProgressSchema,
      default: () => ({}),
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  defaultSchemaOptions,
);

watchlistSchema.index({ user: 1, tmdbId: 1, mediaType: 1 }, { unique: true });
watchlistSchema.index({ user: 1, status: 1 });
watchlistSchema.index({ user: 1, updatedAt: -1 });

export type WatchlistDocument = HydratedDocument<InferSchemaType<typeof watchlistSchema>>;
export type WatchlistModelType = Model<InferSchemaType<typeof watchlistSchema>>;

export const WatchlistModel = model('WatchlistItem', watchlistSchema);
