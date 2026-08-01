import { Schema, model, type HydratedDocument, type InferSchemaType, type Model } from 'mongoose';

import {
  defaultSchemaOptions,
  mediaTypeField,
  tmdbIdField,
  userRefField,
} from '@common/utils/mongoose';

const ratingSchema = new Schema(
  {
    user: userRefField,
    tmdbId: tmdbIdField,
    mediaType: mediaTypeField,
    score: {
      type: Number,
      required: true,
      min: 0.5,
      max: 10,
    },
    review: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
  },
  defaultSchemaOptions,
);

ratingSchema.index({ user: 1, tmdbId: 1, mediaType: 1 }, { unique: true });
ratingSchema.index({ user: 1, score: -1 });
ratingSchema.index({ user: 1, updatedAt: -1 });

export type RatingDocument = HydratedDocument<InferSchemaType<typeof ratingSchema>>;
export type RatingModelType = Model<InferSchemaType<typeof ratingSchema>>;

export const RatingModel = model('Rating', ratingSchema);
