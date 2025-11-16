import mongoose, { Document, Schema } from 'mongoose';

export interface IBreak extends Document {
  _id: string;
  shiftId: string;
  employeeId: string;
  start: Date;
  end?: Date;
  duration: number;
  type: 'automatic' | 'manual';
  organizationId: string;
  createdAt: Date;
}

const breakSchema = new Schema<IBreak>(
  {
    shiftId: {
      type: String,
      required: [true, 'Shift ID is required'],
      ref: 'Shift'
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      ref: 'User'
    },
    start: {
      type: Date,
      required: [true, 'Start time is required']
    },
    end: {
      type: Date
    },
    duration: {
      type: Number,
      default: 0,
      min: [0, 'Duration cannot be negative']
    },
    type: {
      type: String,
      enum: ['automatic', 'manual'],
      default: 'automatic'
    },
    organizationId: {
      type: String,
      required: [true, 'Organization ID is required'],
      ref: 'Organization'
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

breakSchema.index({ shiftId: 1 });
breakSchema.index({ employeeId: 1 });
breakSchema.index({ organizationId: 1 });
breakSchema.index({ start: -1 });
breakSchema.index({ employeeId: 1, start: -1 });

breakSchema.pre('save', function(next) {
  if (this.end && this.start) {
    this.duration = this.end.getTime() - this.start.getTime();
  }
  next();
});

export default mongoose.model<IBreak>('Break', breakSchema);
