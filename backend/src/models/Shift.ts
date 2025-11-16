import mongoose, { Document, Schema } from 'mongoose';

export interface IShift extends Document {
  _id: string;
  type: 'manual' | 'automatic';
  start: number;
  end?: number;
  timezoneOffset: number;
  overtimeStart: number;
  user: string;
  computer: string;
  domain: string;
  name: string;
  hwid: string;
  os: string;
  osVersion: string;
  processed: boolean;
  paid: boolean;
  payRate: number;
  overtimePayRate: number;
  employeeId: string;
  teamId?: string;
  sharedSettingsId?: string;
  organizationId: string;
  negativeTime: number;
  deletedScreenshots: number;
  startTranslated: number;
  endTranslated?: number;
  overtimeStartTranslated: number;
  createdAt: Date;
  updatedAt: Date;
}

const shiftSchema = new Schema<IShift>(
  {
    type: {
      type: String,
      enum: ['manual', 'automatic'],
      default: 'automatic'
    },
    start: {
      type: Number,
      required: [true, 'Start time is required']
    },
    end: {
      type: Number
    },
    timezoneOffset: {
      type: Number,
      default: 0
    },
    overtimeStart: {
      type: Number,
      default: 0
    },
    user: {
      type: String,
      required: true,
      trim: true
    },
    computer: {
      type: String,
      trim: true,
      default: ''
    },
    domain: {
      type: String,
      trim: true,
      default: ''
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    hwid: {
      type: String,
      trim: true,
      default: ''
    },
    os: {
      type: String,
      trim: true,
      default: ''
    },
    osVersion: {
      type: String,
      trim: true,
      default: ''
    },
    processed: {
      type: Boolean,
      default: false
    },
    paid: {
      type: Boolean,
      default: false
    },
    payRate: {
      type: Number,
      default: 0,
      min: [0, 'Pay rate cannot be negative']
    },
    overtimePayRate: {
      type: Number,
      default: 0,
      min: [0, 'Overtime pay rate cannot be negative']
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      ref: 'User'
    },
    teamId: {
      type: String,
      ref: 'Team'
    },
    sharedSettingsId: {
      type: String,
      ref: 'SharedSettings'
    },
    organizationId: {
      type: String,
      required: [true, 'Organization ID is required'],
      ref: 'Organization'
    },
    negativeTime: {
      type: Number,
      default: 0
    },
    deletedScreenshots: {
      type: Number,
      default: 0
    },
    startTranslated: {
      type: Number
    },
    endTranslated: {
      type: Number
    },
    overtimeStartTranslated: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

shiftSchema.index({ employeeId: 1 });
shiftSchema.index({ organizationId: 1 });
shiftSchema.index({ start: -1 });
shiftSchema.index({ end: -1 });
shiftSchema.index({ employeeId: 1, start: -1 });
shiftSchema.index({ organizationId: 1, start: -1 });
shiftSchema.index({ teamId: 1, start: -1 });

shiftSchema.virtual('activities', {
  ref: 'Activity',
  localField: '_id',
  foreignField: 'shiftId'
});

shiftSchema.virtual('screenshots', {
  ref: 'Screenshot',
  localField: '_id',
  foreignField: 'shiftId'
});

shiftSchema.virtual('breaks', {
  ref: 'Break',
  localField: '_id',
  foreignField: 'shiftId'
});

shiftSchema.pre('save', function(next) {
  if (this.isModified('start')) {
    this.startTranslated = this.start + this.timezoneOffset;
  }
  if (this.isModified('end') && this.end) {
    this.endTranslated = this.end + this.timezoneOffset;
  }
  next();
});

export default mongoose.model<IShift>('Shift', shiftSchema);
