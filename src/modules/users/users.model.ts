import { Schema, model, type HydratedDocument, type InferSchemaType, type Model } from 'mongoose';

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  },
);

export type UserDocument = HydratedDocument<InferSchemaType<typeof userSchema>>;
export type UserModel = Model<InferSchemaType<typeof userSchema>>;

export const UserModel = model('User', userSchema);
