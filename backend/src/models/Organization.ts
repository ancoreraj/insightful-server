import mongoose, { Document, Schema } from 'mongoose';

export interface IOrganization extends Document {
  _id: string;
  name: string;
  settings: {
    timezone?: string;
    workingHours?: {
      start: string;
      end: string;
    };
    currency?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      minlength: [2, 'Organization name must be at least 2 characters'],
      maxlength: [100, 'Organization name cannot exceed 100 characters']
    },
    settings: {
      timezone: {
        type: String,
        default: 'UTC'
      },
      workingHours: {
        start: {
          type: String,
          default: '09:00'
        },
        end: {
          type: String,
          default: '17:00'
        }
      },
      currency: {
        type: String,
        default: 'USD'
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

organizationSchema.index({ name: 1 });

organizationSchema.virtual('employees', {
  ref: 'User',
  localField: '_id',
  foreignField: 'organizationId'
});

organizationSchema.virtual('teams', {
  ref: 'Team',
  localField: '_id',
  foreignField: 'organizationId'
});

organizationSchema.virtual('projects', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'organizationId'
});

export default mongoose.model<IOrganization>('Organization', organizationSchema);
