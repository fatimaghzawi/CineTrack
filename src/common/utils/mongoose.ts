import { Schema, type SchemaOptions } from 'mongoose';

import { MediaType, WatchStatus } from '@common/constants/enums';

export const mediaTypeField = {
  type: String,
  enum: Object.values(MediaType),
  required: true,
} as const;

export const watchStatusField = {
  type: String,
  enum: Object.values(WatchStatus),
  required: true,
  default: WatchStatus.PLAN_TO_WATCH,
} as const;

export const tmdbIdField = {
  type: Number,
  required: true,
  min: 1,
} as const;

export const userRefField = {
  type: Schema.Types.ObjectId,
  ref: 'User',
  required: true,
  index: true,
} as const;

export const defaultSchemaOptions: SchemaOptions = {
  timestamps: true,
  toJSON: {
    transform(_doc, ret: Record<string, unknown>) {
      ret.id = String(ret._id);
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
};
