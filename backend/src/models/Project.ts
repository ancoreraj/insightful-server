import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  _id: string;
  name: string;
  archived: boolean;
  billable: boolean;
  payroll: {
    billRate: number;
    overtimeBillRate: number;
  };
  statuses: string[];
  priorities: string[];
  employees: string[];
  creatorId: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [2, 'Project name must be at least 2 characters'],
      maxlength: [200, 'Project name cannot exceed 200 characters']
    },
    archived: {
      type: Boolean,
      default: false
    },
    billable: {
      type: Boolean,
      default: true
    },
    payroll: {
      billRate: {
        type: Number,
        default: 0,
        min: [0, 'Bill rate cannot be negative']
      },
      overtimeBillRate: {
        type: Number,
        default: 0,
        min: [0, 'Overtime bill rate cannot be negative']
      }
    },
    statuses: {
      type: [String],
      default: ['To do', 'On hold', 'In progress', 'Done']
    },
    priorities: {
      type: [String],
      default: ['low', 'medium', 'high']
    },
    employees: [{
      type: String,
      ref: 'User'
    }],
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

projectSchema.index({ organizationId: 1 });
projectSchema.index({ organizationId: 1, archived: 1 });
projectSchema.index({ creatorId: 1 });
projectSchema.index({ employees: 1 });

projectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'projectId'
});

export default mongoose.model<IProject>('Project', projectSchema);
