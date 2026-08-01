import { Schema, model, type HydratedDocument, type InferSchemaType, type Model } from 'mongoose';

import {
  defaultSchemaOptions,
  mediaTypeField,
  tmdbIdField,
  userRefField,
} from '@common/utils/mongoose';

const favoriteSchema = new Schema(
  {
    user: userRefField,
    tmdbId: tmdbIdField,
    mediaType: mediaTypeField,
  },
  defaultSchemaOptions,
);

favoriteSchema.index({ user: 1, tmdbId: 1, mediaType: 1 }, { unique: true });
favoriteSchema.index({ user: 1, createdAt: -1 });

export type FavoriteDocument = HydratedDocument<InferSchemaType<typeof favoriteSchema>>;
export type FavoriteModelType = Model<InferSchemaType<typeof favoriteSchema>>;

export const FavoriteModel = model('Favorite', favoriteSchema);
