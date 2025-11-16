import mongoose, { Document, Schema } from 'mongoose';

export interface ISharedSettings extends Document {
  _id: string;
  name: string;
  screenshotInterval: number;
  trackingEnabled: boolean;
  blurScreenshots: boolean;
  trackApps: boolean;
  trackUrls: boolean;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

const sharedSettingsSchema = new Schema<ISharedSettings>(
  {
    name: {
      type: String,
      required: [true, 'Settings name is required'],
      trim: true
    },
    screenshotInterval: {
      type: Number,
      default: 600000,
      min: [60000, 'Screenshot interval cannot be less than 1 minute'],
      max: [3600000, 'Screenshot interval cannot exceed 1 hour']
    },
    trackingEnabled: {
      type: Boolean,
      default: true
    },
    blurScreenshots: {
      type: Boolean,
      default: false
    },
    trackApps: {
      type: Boolean,
      default: true
    },
    trackUrls: {
      type: Boolean,
      default: true
    },
    organizationId: {
      type: String,
      required: [true, 'Organization ID is required'],
      ref: 'Organization'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

sharedSettingsSchema.index({ organizationId: 1 });

export default mongoose.model<ISharedSettings>('SharedSettings', sharedSettingsSchema);
