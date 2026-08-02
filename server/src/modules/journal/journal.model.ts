import { Schema, model, type HydratedDocument, type InferSchemaType, type Model } from 'mongoose';

import {
  defaultSchemaOptions,
  mediaTypeField,
  tmdbIdField,
  userRefField,
} from '@common/utils/mongoose';

const journalSchema = new Schema(
  {
    user: userRefField,
    tmdbId: tmdbIdField,
    mediaType: mediaTypeField,
    title: {
      type: String,
      trim: true,
      maxlength: 160,
      default: '',
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10_000,
    },
    watchedAt: {
      type: Date,
      default: null,
    },
    mood: {
      type: String,
      trim: true,
      maxlength: 40,
      default: '',
    },
    isSpoiler: {
      type: Boolean,
      default: false,
    },
  },
  defaultSchemaOptions,
);

journalSchema.index({ user: 1, createdAt: -1 });
journalSchema.index({ user: 1, tmdbId: 1, mediaType: 1 });

export type JournalDocument = HydratedDocument<InferSchemaType<typeof journalSchema>>;
export type JournalModelType = Model<InferSchemaType<typeof journalSchema>>;

export const JournalModel = model('JournalEntry', journalSchema);
