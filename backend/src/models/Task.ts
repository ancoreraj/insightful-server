import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  _id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  billable: boolean;
  startDate?: Date;
  dueDate?: Date;
  estimatedHours?: number;
  projectId: string;
  employeeId?: string;
  creatorId: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    name: {
      type: String,
      required: [true, 'Task name is required'],
      trim: true,
      minlength: [2, 'Task name must be at least 2 characters'],
      maxlength: [200, 'Task name cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    status: {
      type: String,
      default: 'To do',
      trim: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    },
    billable: {
      type: Boolean,
      default: true
    },
    startDate: {
      type: Date
    },
    dueDate: {
      type: Date
    },
    estimatedHours: {
      type: Number,
      min: [0, 'Estimated hours cannot be negative']
    },
    projectId: {
      type: String,
      required: [true, 'Project ID is required'],
      ref: 'Project'
    },
    employeeId: {
      type: String,
      ref: 'User'
    },
    creatorId: {
      type: String,
      required: [true, 'Creator ID is required'],
      ref: 'User'
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

taskSchema.index({ organizationId: 1 });
taskSchema.index({ projectId: 1 });
taskSchema.index({ organizationId: 1, projectId: 1 });
taskSchema.index({ employeeId: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });

export default mongoose.model<ITask>('Task', taskSchema);
