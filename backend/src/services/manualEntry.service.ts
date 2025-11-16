import ManualEntry from '../models/ManualEntry';

interface ManualEntryFilters {
  start: number;
  end: number;
  timezone?: string;
  employeeId?: string;
  teamId?: string;
  projectId?: string;
  taskId?: string;
  shiftId?: string;
  limit?: number;
}

class ManualEntryService {

  async listManualEntries(organizationId: string, filters: ManualEntryFilters): Promise<any[]> {
    const { start, end, employeeId, projectId, taskId, shiftId, limit = 10000 } = filters;

    const query: any = {
      organizationId,
      start: { $gte: new Date(start), $lte: new Date(end) }
    };

    if (employeeId) {
      const employeeIds = employeeId.split(',').map(id => id.trim());
      query.employeeId = { $in: employeeIds };
    }

    if (projectId) {
      const projectIds = projectId.split(',').map(id => id.trim());
      query.projectId = { $in: projectIds };
    }

    if (taskId) {
      const taskIds = taskId.split(',').map(id => id.trim());
      query.taskId = { $in: taskIds };
    }

    if (shiftId) {
      const shiftIds = shiftId.split(',').map(id => id.trim());
      query.shiftId = { $in: shiftIds };
    }

    const manualEntries = await ManualEntry.find(query)
      .sort({ start: -1 })
      .limit(limit)
      .lean();

    return manualEntries;
  }
}

export default new ManualEntryService();
