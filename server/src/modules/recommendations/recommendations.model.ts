import { Schema, model, type HydratedDocument, type InferSchemaType, type Model } from 'mongoose';

import {
  defaultSchemaOptions,
  mediaTypeField,
  tmdbIdField,
  userRefField,
} from '@common/utils/mongoose';

/**
 * Cached recommendation payload for a user.
 * Titles themselves always come from TMDb; we only store references + scores.
 */
const recommendationItemSchema = new Schema(
  {
    tmdbId: tmdbIdField,
    mediaType: mediaTypeField,
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    reason: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
  },
  { _id: false },
);

const recommendationSchema = new Schema(
  {
    user: {
      ...userRefField,
      unique: true,
    },
    source: {
      type: String,
      enum: ['tmdb', 'hybrid'],
      required: true,
      default: 'hybrid',
    },
    items: {
      type: [recommendationItemSchema],
      default: [],
    },
    generatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  defaultSchemaOptions,
);

recommendationSchema.index({ user: 1, generatedAt: -1 });

export type RecommendationDocument = HydratedDocument<InferSchemaType<typeof recommendationSchema>>;
export type RecommendationModelType = Model<InferSchemaType<typeof recommendationSchema>>;

export const RecommendationModel = model('RecommendationCache', recommendationSchema);
