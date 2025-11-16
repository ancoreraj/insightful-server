import mongoose, { Document, Schema } from 'mongoose';

export interface IManualEntry extends Document {
  _id: string;
  employeeId: string;
  projectId?: string;
  taskId?: string;
  shiftId?: string;
  start: Date;
  end: Date;
  duration: number;
  description?: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

const manualEntrySchema = new Schema<IManualEntry>(
  {
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
    shiftId: {
      type: String,
      ref: 'Shift'
    },
    start: {
      type: Date,
      required: [true, 'Start time is required']
    },
    end: {
      type: Date,
      required: [true, 'End time is required']
    },
    duration: {
      type: Number,
      default: 0,
      min: [0, 'Duration cannot be negative']
    },
    description: {
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

manualEntrySchema.index({ employeeId: 1 });
manualEntrySchema.index({ projectId: 1 });
manualEntrySchema.index({ shiftId: 1 });
manualEntrySchema.index({ organizationId: 1 });
manualEntrySchema.index({ start: -1 });
manualEntrySchema.index({ organizationId: 1, start: -1 });

export default mongoose.model<IManualEntry>('ManualEntry', manualEntrySchema);
