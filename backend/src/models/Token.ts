import mongoose, { Document, Schema } from 'mongoose';

export interface IToken extends Document {
  _id: string;
  userId: string;
  token: string;
  type: 'refresh' | 'api' | 'reset_password' | 'invitation';
  name?: string;
  expiresAt?: Date;
  revoked: boolean;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const tokenSchema = new Schema<IToken>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      ref: 'User'
    },
    token: {
      type: String,
      required: [true, 'Token is required'],
      unique: true
    },
    type: {
      type: String,
      enum: ['refresh', 'api', 'reset_password', 'invitation'],
      required: [true, 'Token type is required']
    },
    name: {
      type: String,
      trim: true
    },
    expiresAt: {
      type: Date
    },
    revoked: {
      type: Boolean,
      default: false
    },
    lastUsedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tokenSchema.index({ userId: 1 });
tokenSchema.index({ token: 1 }, { unique: true });
tokenSchema.index({ type: 1 });
tokenSchema.index({ userId: 1, type: 1 });
tokenSchema.index({ expiresAt: 1 });
tokenSchema.index({ revoked: 1 });

tokenSchema.methods.isValid = function(): boolean {
  if (this.revoked) return false;
  if (this.expiresAt && this.expiresAt < new Date()) return false;
  return true;
};

tokenSchema.statics.cleanupExpired = async function() {
  const now = new Date();
  await this.deleteMany({
    expiresAt: { $lt: now }
  });
};

export default mongoose.model<IToken>('Token', tokenSchema);
