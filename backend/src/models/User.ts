import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  sharedSettingsId?: string;
  accountId?: string;
  identifier: string;
  type: 'personal' | 'admin';
  organizationId: string;
  projects: string[];
  deactivated: boolean;
  invited: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false
    },
    sharedSettingsId: {
      type: String,
      ref: 'SharedSettings'
    },
    accountId: {
      type: String,
      required: false
    },
    identifier: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['personal', 'admin'],
      default: 'personal'
    },
    organizationId: {
      type: String,
      required: [true, 'Organization ID is required'],
      ref: 'Organization'
    },
    projects: [{
      type: String,
      ref: 'Project'
    }],
    deactivated: {
      type: Boolean,
      default: false
    },
    invited: {
      type: Number,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: function(_doc, ret) {
        const { password, ...rest } = ret;
        return rest;
      }
    },
    toObject: { virtuals: true }
  }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ organizationId: 1 });
userSchema.index({ teamId: 1 });
userSchema.index({ organizationId: 1, email: 1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
