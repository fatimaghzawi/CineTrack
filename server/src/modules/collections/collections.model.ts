import { Schema, model, type HydratedDocument, type InferSchemaType, type Model } from 'mongoose';

import {
  defaultSchemaOptions,
  mediaTypeField,
  tmdbIdField,
  userRefField,
} from '@common/utils/mongoose';

const collectionItemSchema = new Schema(
  {
    tmdbId: tmdbIdField,
    mediaType: mediaTypeField,
    note: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const collectionSchema = new Schema(
  {
    user: userRefField,
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    coverTmdbId: {
      type: Number,
      min: 1,
      default: null,
    },
    coverMediaType: {
      type: String,
      enum: ['movie', 'tv'],
      default: null,
    },
    items: {
      type: [collectionItemSchema],
      default: [],
    },
  },
  defaultSchemaOptions,
);

collectionSchema.index({ user: 1, name: 1 }, { unique: true });
collectionSchema.index({ user: 1, updatedAt: -1 });
collectionSchema.index({ 'items.tmdbId': 1, 'items.mediaType': 1 });

export type CollectionDocument = HydratedDocument<InferSchemaType<typeof collectionSchema>>;
export type CollectionModelType = Model<InferSchemaType<typeof collectionSchema>>;

export const CollectionModel = model('Collection', collectionSchema);
