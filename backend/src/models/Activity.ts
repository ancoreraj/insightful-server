import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  _id: string;
  shiftId: string;
  employeeId: string;
  projectId?: string;
  taskId?: string;
  start: Date;
  end?: Date;
  duration: number;
  productivity: number;
  applicationName?: string;
  windowTitle?: string;
  category?: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>(
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
    projectId: {
      type: String,
      ref: 'Project'
    },
    taskId: {
      type: String,
      ref: 'Task'
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
    productivity: {
      type: Number,
      default: 0,
      min: [0, 'Productivity cannot be less than 0'],
      max: [100, 'Productivity cannot exceed 100']
    },
    applicationName: {
      type: String,
      trim: true
    },
    windowTitle: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      trim: true
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

activitySchema.index({ shiftId: 1 });
activitySchema.index({ employeeId: 1 });
activitySchema.index({ organizationId: 1 });
activitySchema.index({ projectId: 1 });
activitySchema.index({ taskId: 1 });
activitySchema.index({ start: -1 });
activitySchema.index({ employeeId: 1, start: -1 });
activitySchema.index({ organizationId: 1, start: -1 });

activitySchema.pre('save', function(next) {
  if (this.end && this.start) {
    this.duration = this.end.getTime() - this.start.getTime();
  }
  next();
});

export default mongoose.model<IActivity>('Activity', activitySchema);
