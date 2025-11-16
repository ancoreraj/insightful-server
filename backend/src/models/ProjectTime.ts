import mongoose, { Document, Schema } from 'mongoose';

export interface IProjectTime extends Document {
  _id: string;
  employeeId: string;
  projectId: string;
  taskId?: string;
  shiftId: string;
  start: Date;
  end?: Date;
  duration: number;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

const projectTimeSchema = new Schema<IProjectTime>(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      ref: 'User'
    },
    projectId: {
      type: String,
      required: [true, 'Project ID is required'],
      ref: 'Project'
    },
    taskId: {
      type: String,
      ref: 'Task'
    },
    shiftId: {
      type: String,
      required: [true, 'Shift ID is required'],
      ref: 'Shift'
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

projectTimeSchema.index({ employeeId: 1 });
projectTimeSchema.index({ projectId: 1 });
projectTimeSchema.index({ shiftId: 1 });
projectTimeSchema.index({ organizationId: 1 });
projectTimeSchema.index({ start: -1 });
projectTimeSchema.index({ organizationId: 1, start: -1 });

export default mongoose.model<IProjectTime>('ProjectTime', projectTimeSchema);
