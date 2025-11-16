import Screenshot from '../models/Screenshot';

export interface AppUsageStats {
  app: string;
  count: number;
  percentage: number;
  lastUsed: Date;
}

export interface AppUsageQuery {
  employeeId?: string;
  projectId?: string;
  taskId?: string;
  start: number;
  end: number;
}

class AppUsageService {
  async getAppUsage(query: AppUsageQuery): Promise<AppUsageStats[]> {
    const { employeeId, projectId, taskId, start, end } = query;

    const matchQuery: any = {
      timestamp: { $gte: start, $lte: end },
      app: { $exists: true, $nin: [null, ''] }
    };

    if (employeeId) {
      matchQuery.employeeId = employeeId;
    }

    if (projectId) {
      matchQuery.projectId = projectId;
    }

    if (taskId) {
      matchQuery.taskId = taskId;
    }

    const appStats = await Screenshot.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$app',
          count: { $sum: 1 },
          lastUsed: { $max: '$timestamp' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    console.log("appStats", appStats);

    const totalScreenshots = appStats.reduce((sum: number, stat: any) => sum + stat.count, 0);

    const results: AppUsageStats[] = appStats.map((stat: any) => ({
      app: stat._id,
      count: stat.count,
      percentage: totalScreenshots > 0 ? (stat.count / totalScreenshots) * 100 : 0,
      lastUsed: new Date(stat.lastUsed)
    }));

    return results;
  }
}

export default new AppUsageService();
