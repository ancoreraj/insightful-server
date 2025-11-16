import Shift, { IShift } from '../models/Shift';
import User from '../models/User';
import logger from '../utils/logger';

export interface CreateShiftData {
  type: 'auto' | 'manual';
  start: number; // Unix timestamp in ms
  end?: number; // Unix timestamp in ms
  timezoneOffset?: number;
  overtimeStart?: number;
  user?: string;
  computer?: string;
  domain?: string;
  name?: string;
  hwid?: string;
  os?: string;
  osVersion?: string;
  processed?: boolean;
  paid?: boolean;
  payRate?: number;
  overtimePayRate?: number;
  employeeId: string;
  sharedSettingsId?: string;
}

export interface UpdateShiftData {
  end?: number;
  processed?: boolean;
  paid?: boolean;
  payRate?: number;
  overtimePayRate?: number;
}

export interface ListShiftsFilters {
  start: number; // Required - unix timestamp
  end: number; // Required - unix timestamp
  timezone?: string;
  employeeId?: string | string[];
  projectId?: string | string[];
  taskId?: string | string[];
  shiftId?: string | string[];
  productivity?: number;
  limit?: number;
  groupBy?: string;
}

export class ShiftService {
  async createShift(data: CreateShiftData, organizationId: string): Promise<IShift> {
    const {
      type,
      start,
      end,
      timezoneOffset,
      overtimeStart,
      user,
      computer,
      domain,
      name,
      hwid,
      os,
      osVersion,
      processed,
      paid,
      payRate,
      overtimePayRate,
      employeeId,
      sharedSettingsId
    } = data;

    const employee = await User.findOne({
      _id: employeeId,
      organizationId
    });

    if (!employee) {
      throw new Error('EMPLOYEE_NOT_FOUND');
    }

    const shift = await Shift.create({
      type,
      start,
      end,
      timezoneOffset: timezoneOffset || 0,
      overtimeStart: overtimeStart || 0,
      user: user || employee.email,
      computer: computer || '',
      domain: domain || '',
      name: name || employee.name,
      hwid: hwid || '',
      os: os || '',
      osVersion: osVersion || '',
      processed: processed || false,
      paid: paid || false,
      payRate: payRate || 0,
      overtimePayRate: overtimePayRate || 0,
      employeeId,
      sharedSettingsId: sharedSettingsId || employee.sharedSettingsId,
      organizationId,
      negativeTime: 0,
      deletedScreenshots: 0,
      startTranslated: start,
      endTranslated: end ? end : undefined,
      overtimeStartTranslated: overtimeStart || 0
    });

    logger.info(`Shift created for employee ${employeeId}: ${shift._id}`);

    return shift;
  }

  async getShift(shiftId: string, organizationId: string): Promise<IShift> {
    const shift = await Shift.findOne({
      _id: shiftId,
      organizationId
    })
      .populate('employeeId', 'name email')
      .populate('teamId', 'name');

    if (!shift) {
      throw new Error('SHIFT_NOT_FOUND');
    }

    return shift;
  }

  async listShifts(organizationId: string, filters: ListShiftsFilters): Promise<IShift[]> {
    const {
      start,
      end,
      employeeId,
      shiftId,
      limit
    } = filters;

    const query: any = {
      organizationId,
      start: { $gte: start, $lte: end }
    };

    if (employeeId) {
      const ids = Array.isArray(employeeId) ? employeeId : employeeId.split(',');
      query.employeeId = { $in: ids };
    }

    if (shiftId) {
      const ids = Array.isArray(shiftId) ? shiftId : shiftId.split(',');
      query._id = { $in: ids };
    }

    const shiftsQuery = Shift.find(query)
      .populate('employeeId', 'name email')
      .populate('teamId', 'name')
      .sort({ start: -1 });

    if (limit) {
      shiftsQuery.limit(limit);
    }

    const shifts = await shiftsQuery;

    return shifts;
  }

  async updateShift(
    shiftId: string,
    data: UpdateShiftData,
    organizationId: string
  ): Promise<IShift> {
    const shift = await Shift.findOne({
      _id: shiftId,
      organizationId
    });

    if (!shift) {
      throw new Error('SHIFT_NOT_FOUND');
    }

    if (data.end !== undefined) {
      shift.end = data.end;
      shift.endTranslated = data.end;
    }
    if (data.processed !== undefined) shift.processed = data.processed;
    if (data.paid !== undefined) shift.paid = data.paid;
    if (data.payRate !== undefined) shift.payRate = data.payRate;
    if (data.overtimePayRate !== undefined) shift.overtimePayRate = data.overtimePayRate;

    await shift.save();

    logger.info(`Shift updated: ${shift._id}`);

    return shift;
  }

  async deleteShift(shiftId: string, organizationId: string): Promise<void> {
    const shift = await Shift.findOne({
      _id: shiftId,
      organizationId
    });

    if (!shift) {
      throw new Error('SHIFT_NOT_FOUND');
    }

    await shift.deleteOne();

    logger.info(`Shift deleted: ${shiftId}`);
  }

  async getEmployeeShifts(
    employeeId: string,
    organizationId: string,
    start: number,
    end: number
  ): Promise<IShift[]> {
    const shifts = await Shift.find({
      organizationId,
      employeeId,
      start: { $gte: start },
      end: { $lte: end }
    })
      .populate('teamId', 'name')
      .sort({ start: -1 });

    return shifts;
  }

  async getActiveShift(employeeId: string, organizationId: string): Promise<IShift | null> {
    const shift = await Shift.findOne({
      organizationId,
      employeeId,
      end: { $exists: false }
    }).sort({ start: -1 });

    return shift;
  }

  async endShift(employeeId: string, organizationId: string, endTime: number): Promise<IShift> {
    const shift = await this.getActiveShift(employeeId, organizationId);

    if (!shift) {
      throw new Error('NO_ACTIVE_SHIFT');
    }

    shift.end = endTime;
    shift.endTranslated = endTime;
    await shift.save();

    logger.info(`Shift ended for employee ${employeeId}: ${shift._id}`);

    return shift;
  }

  calculateTotalTime(shifts: IShift[]): number {
    return shifts.reduce((total, shift) => {
      if (shift.end) {
        return total + (shift.end - shift.start);
      }
      return total;
    }, 0);
  }

  async markAsPaid(shiftId: string, organizationId: string): Promise<IShift> {
    const shift = await Shift.findOne({
      _id: shiftId,
      organizationId
    });

    if (!shift) {
      throw new Error('SHIFT_NOT_FOUND');
    }

    shift.paid = true;
    shift.processed = true;
    await shift.save();

    logger.info(`Shift marked as paid: ${shiftId}`);

    return shift;
  }
}


export default new ShiftService();
