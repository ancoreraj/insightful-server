import { Request, Response } from 'express';
import appUsageService from '../services/appUsage.service';
import logger from '../utils/logger';

class AppUsageController {
  /**
   * Get app usage statistics
   * GET /api/app-usage
   */
  async getAppUsage(req: Request, res: Response) {
    try {
      const { employeeId, projectId, taskId, start, end } = req.query;

      if (!start || !end) {
        return res.status(400).json({
          success: false,
          message: 'Start and end timestamps are required'
        });
      }

      const query = {
        employeeId: employeeId as string | undefined,
        projectId: projectId as string | undefined,
        taskId: taskId as string | undefined,
        start: parseInt(start as string),
        end: parseInt(end as string)
      };

      const appUsageStats = await appUsageService.getAppUsage(query);

      return res.status(200).json({
        success: true,
        data: appUsageStats
      });
    } catch (error) {
      logger.error('Error getting app usage:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get app usage statistics'
      });
    }
  }
}

export default new AppUsageController();
