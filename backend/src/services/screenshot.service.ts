import Screenshot, { IScreenshot } from '../models/Screenshot';
import User from '../models/User';
import logger from '../utils/logger';
import { generatePresignedUrl } from '../utils/s3';

export interface CreateScreenshotData {
  gateways?: string[];
  type?: 'scheduled' | 'on-demand' | 'manual';
  timestamp: number;
  timezoneOffset?: number;
  app: string;
  appFileName?: string;
  appFilePath?: string;
  title?: string;
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
  osVersion?: string;
  active?: boolean;
  processed?: boolean;
  employeeId: string;
  teamId?: string;
  sharedSettingsId?: string;
  appId?: string;
  appLabelId?: string;
  categoryId?: string;
  categoryLabelId?: string;
  productivity?: number;
  site?: string;
  link?: string;
  filePath?: string;
  blurred?: boolean;
  activityLevel?: number;
  permission: boolean;
}

export interface ListScreenshotsFilters {
  start: number; // Required - unix timestamp
  end: number; // Required - unix timestamp
  timezone?: string;
  employeeId?: string | string[];
  teamId?: string | string[];
  projectId?: string | string[];
  taskId?: string | string[];
  shiftId?: string | string[];
  sortBy?: string;
  limit?: number;
  next?: string;
}

export class ScreenshotService {

  async createScreenshot(data: CreateScreenshotData, organizationId: string): Promise<IScreenshot> {
    const { employeeId, timestamp, timezoneOffset, permission } = data;

    const employee = await User.findOne({
      _id: employeeId,
      organizationId
    });

    if (!employee) {
      throw new Error('EMPLOYEE_NOT_FOUND');
    }

    const screenshot = await Screenshot.create({
      ...data,
      organizationId,
      timestampTranslated: timestamp + (timezoneOffset || 0),
      permission
    });

    logger.info(`Screenshot created for employee ${employeeId}: ${screenshot._id}`);

    return screenshot;
  }

  async listScreenshots(organizationId: string, filters: ListScreenshotsFilters): Promise<any> {
    const {
      start,
      end,
      employeeId,
      teamId,
      projectId,
      taskId,
      shiftId,
      limit = 10000,
      sortBy = 'timestamp'
    } = filters;

    const query: any = {
      organizationId,
      timestamp: { $gte: start, $lte: end }
    };
    if (employeeId) {
      const ids = Array.isArray(employeeId) ? employeeId : employeeId.split(',');
      query.employeeId = { $in: ids };
    }

    if (teamId) {
      const ids = Array.isArray(teamId) ? teamId : teamId.split(',');
      query.teamId = { $in: ids };
    }

    if (projectId) {
      const ids = Array.isArray(projectId) ? projectId : projectId.split(',');
      query.projectId = { $in: ids };
    }

    if (taskId) {
      const ids = Array.isArray(taskId) ? taskId : taskId.split(',');
      query.taskId = { $in: ids };
    }

    if (shiftId) {
      const ids = Array.isArray(shiftId) ? shiftId : shiftId.split(',');
      query.shiftId = { $in: ids };
    }

    let sortField: any = { timestamp: -1 };
    if (sortBy === 'asc') {
      sortField = { timestamp: 1 };
    }
    const screenshots = await Screenshot.find(query)
      .populate('employeeId', 'name email')
      .populate('teamId', 'name')
      .populate('projectId', 'name')
      .populate('taskId', 'name')
      .sort(sortField)
      .limit(limit);

    const screenshotsWithPresignedUrls = await Promise.all(
      screenshots.map(async (screenshot) => {
        const screenshotObj = screenshot.toObject();
        if (screenshotObj.filePath) {
          screenshotObj.filePath = await generatePresignedUrl(screenshotObj.filePath, 3600); // 1 hour expiry
        }
        return screenshotObj;
      })
    );

    return screenshotsWithPresignedUrls;
  }

  async paginateScreenshots(organizationId: string, filters: ListScreenshotsFilters): Promise<any> {
    const screenshots = await this.listScreenshots(organizationId, filters);

    return {
      data: screenshots,
      next: null,
      hasMore: screenshots.length >= (filters.limit || 10000)
    };
  }

  async getScreenshot(screenshotId: string, organizationId: string): Promise<any> {
    const screenshot = await Screenshot.findOne({
      _id: screenshotId,
      organizationId
    })
      .populate('employeeId', 'name email')
      .populate('teamId', 'name')
      .populate('projectId', 'name')
      .populate('taskId', 'name');

    if (!screenshot) {
      throw new Error('SCREENSHOT_NOT_FOUND');
    }

    const screenshotObj = screenshot.toObject();
    if (screenshotObj.filePath) {
      screenshotObj.filePath = await generatePresignedUrl(screenshotObj.filePath, 3600);
    }

    return screenshotObj;
  }

  async deleteScreenshot(screenshotId: string, organizationId: string): Promise<void> {
    const screenshot = await Screenshot.findOne({
      _id: screenshotId,
      organizationId
    });

    if (!screenshot) {
      throw new Error('SCREENSHOT_NOT_FOUND');
    }

    await screenshot.deleteOne();

    logger.info(`Screenshot deleted: ${screenshotId}`);
  }

  async getEmployeeScreenshots(
    employeeId: string,
    organizationId: string,
    start: number,
    end: number
  ): Promise<IScreenshot[]> {
    const screenshots = await Screenshot.find({
      organizationId,
      employeeId,
      timestamp: { $gte: start, $lte: end }
    })
      .sort({ timestamp: -1 });

    return screenshots;
  }

  async getShiftScreenshots(
    shiftId: string,
    organizationId: string
  ): Promise<IScreenshot[]> {
    const screenshots = await Screenshot.find({
      organizationId,
      shiftId
    })
      .sort({ timestamp: -1 });

    return screenshots;
  }

  async getScreenshotsWithPermissionIssues(
    organizationId: string,
    start: number,
    end: number
  ): Promise<IScreenshot[]> {
    const screenshots = await Screenshot.find({
      organizationId,
      timestamp: { $gte: start, $lte: end },
      permission: false
    })
      .populate('employeeId', 'name email')
      .sort({ timestamp: -1 });

    return screenshots;
  }

  async countScreenshotsByEmployee(
    employeeId: string,
    organizationId: string,
    start: number,
    end: number
  ): Promise<number> {
    return await Screenshot.countDocuments({
      organizationId,
      employeeId,
      timestamp: { $gte: start, $lte: end }
    });
  }

  async getScreenshotStats(
    organizationId: string,
    start: number,
    end: number
  ): Promise<any> {
    const [total, withPermission, withoutPermission, blurred] = await Promise.all([
      Screenshot.countDocuments({
        organizationId,
        timestamp: { $gte: start, $lte: end }
      }),
      Screenshot.countDocuments({
        organizationId,
        timestamp: { $gte: start, $lte: end },
        permission: true
      }),
      Screenshot.countDocuments({
        organizationId,
        timestamp: { $gte: start, $lte: end },
        permission: false
      }),
      Screenshot.countDocuments({
        organizationId,
        timestamp: { $gte: start, $lte: end },
        blurred: true
      })
    ]);

    return {
      total,
      withPermission,
      withoutPermission,
      blurred,
      permissionRate: total > 0 ? (withPermission / total) * 100 : 100
    };
  }

  async markAsProcessed(screenshotId: string, organizationId: string): Promise<IScreenshot> {
    const screenshot = await Screenshot.findOne({
      _id: screenshotId,
      organizationId
    });

    if (!screenshot) {
      throw new Error('SCREENSHOT_NOT_FOUND');
    }

    screenshot.processed = true;
    await screenshot.save();

    return screenshot;
  }
}

export default new ScreenshotService();
