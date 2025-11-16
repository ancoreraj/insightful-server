import mongoose, { Document, Schema } from 'mongoose';

export interface IScreenshot extends Document {
  _id: string;
  gateways?: string[];
  type: 'scheduled' | 'on-demand' | 'manual';
  timestamp: number;
  timezoneOffset: number;
  app: string;
  appFileName: string;
  appFilePath: string;
  title: string;
  url?: string;
  document?: string;
  windowId?: string;
  shiftId?: string;
  projectId?: string;
  taskId?: string;
  taskStatus?: string;
  taskPriority?: string;
  user: string;
  computer: string;
  domain?: string;
  name: string;
  hwid: string;
  os: string;
  osVersion: string;
  active: boolean;
  processed: boolean;
  employeeId: string;
  teamId?: string;
  sharedSettingsId?: string;
  organizationId: string;
  appId?: string;
  appLabelId?: string;
  categoryId?: string;
  categoryLabelId?: string;
  productivity?: number;
  site?: string;
  timestampTranslated: number;
  link?: string;
  filePath?: string;
  blurred?: boolean;
  activityLevel?: number;
  permission: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const screenshotSchema = new Schema<IScreenshot>(
  {
    gateways: [{
      type: String
    }],
    type: {
      type: String,
      enum: ['scheduled', 'on-demand', 'manual'],
      default: 'scheduled'
    },
    timestamp: {
      type: Number,
      required: [true, 'Timestamp is required']
    },
    timezoneOffset: {
      type: Number,
      default: 0
    },
    app: {
      type: String,
      required: [true, 'App name is required']
    },
    appFileName: {
      type: String,
      default: ''
    },
    appFilePath: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    url: {
      type: String
    },
    document: {
      type: String
    },
    windowId: {
      type: String
    },
    shiftId: {
      type: String,
      ref: 'Shift'
    },
    projectId: {
      type: String,
      ref: 'Project'
    },
    taskId: {
      type: String,
      ref: 'Task'
    },
    taskStatus: {
      type: String
    },
    taskPriority: {
      type: String
    },
    user: {
      type: String,
      required: [true, 'User is required']
    },
    computer: {
      type: String,
      required: [true, 'Computer is required']
    },
    domain: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      required: [true, 'Name is required']
    },
    hwid: {
      type: String,
      required: [true, 'Hardware ID is required']
    },
    os: {
      type: String,
      required: [true, 'OS is required']
    },
    osVersion: {
      type: String,
      default: ''
    },
    active: {
      type: Boolean,
      default: true
    },
    processed: {
      type: Boolean,
      default: false
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
      type: String
    },
    organizationId: {
      type: String,
      required: [true, 'Organization ID is required'],
      ref: 'Organization'
    },
    appId: {
      type: String
    },
    appLabelId: {
      type: String
    },
    categoryId: {
      type: String
    },
    categoryLabelId: {
      type: String
    },
    productivity: {
      type: Number,
      min: -1,
      max: 1
    },
    site: {
      type: String
    },
    timestampTranslated: {
      type: Number
    },
    link: {
      type: String
    },
    filePath: {
      type: String
    },
    blurred: {
      type: Boolean,
      default: false
    },
    activityLevel: {
      type: Number,
      min: 0,
      max: 100
    },
    permission: {
      type: Boolean,
      default: true,
      required: [true, 'Permission flag is required']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

screenshotSchema.index({ shiftId: 1 });
screenshotSchema.index({ employeeId: 1 });
screenshotSchema.index({ organizationId: 1 });
screenshotSchema.index({ timestamp: -1 });
screenshotSchema.index({ employeeId: 1, timestamp: -1 });
screenshotSchema.index({ organizationId: 1, timestamp: -1 });
screenshotSchema.index({ projectId: 1, timestamp: -1 });
screenshotSchema.index({ taskId: 1, timestamp: -1 });

export default mongoose.model<IScreenshot>('Screenshot', screenshotSchema);
