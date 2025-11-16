import { Request, Response } from 'express';
import shiftService from '../services/shift.service';
import screenshotService from '../services/screenshot.service';
import activityService from '../services/activity.service';
import breakService from '../services/break.service';
import projectTimeService from '../services/projectTime.service';
import manualEntryService from '../services/manualEntry.service';
import logger from '../utils/logger';

/**
 * Create a new shift
 * POST /api/analytics/shift
 */
export const createShift = async (req: Request, res: Response): Promise<void> => {
  try {
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
    } = req.body;

    if (!type || !start || !employeeId) {
      res.status(422).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Type, start time, and employee ID are required',
          details: [
            ...(!type ? [{ field: 'type', message: 'Type is required' }] : []),
            ...(!start ? [{ field: 'start', message: 'Start time is required' }] : []),
            ...(!employeeId ? [{ field: 'employeeId', message: 'Employee ID is required' }] : [])
          ]
        }
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          statusCode: 401,
          message: 'Authentication required'
        }
      });
      return;
    }

    const shift = await shiftService.createShift(
      {
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
      },
      req.user.organizationId
    );

    res.status(201).json({
      success: true,
      data: shift
    });
  } catch (error: any) {
    if (error.message === 'EMPLOYEE_NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: {
          statusCode: 404,
          message: 'Employee not found'
        }
      });
      return;
    }

    logger.error('Create shift error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while creating shift'
      }
    });
  }
};

/**
 * Find/List shifts with filters
 * GET /api/analytics/shift
 */
export const findShifts = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          statusCode: 401,
          message: 'Authentication required'
        }
      });
      return;
    }

    const start = parseInt(req.query.start as string);
    const end = parseInt(req.query.end as string);

    if (!start || !end) {
      res.status(422).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Start and end timestamps are required',
          details: [
            ...(!start ? [{ field: 'start', message: 'Start timestamp is required' }] : []),
            ...(!end ? [{ field: 'end', message: 'End timestamp is required' }] : [])
          ]
        }
      });
      return;
    }

    const filters = {
      start,
      end,
      timezone: req.query.timezone as string,
      employeeId: req.query.employeeId as string,
      teamId: req.query.teamId as string,
      projectId: req.query.projectId as string,
      taskId: req.query.taskId as string,
      shiftId: req.query.shiftId as string,
      productivity: req.query.productivity ? parseFloat(req.query.productivity as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      groupBy: req.query.groupBy as string
    };

    const shifts = await shiftService.listShifts(req.user.organizationId, filters);

    res.status(200).json(shifts);
  } catch (error) {
    logger.error('Find shifts error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while fetching shifts'
      }
    });
  }
};

/**
 * Get shift by ID
 * GET /api/analytics/shift/:id
 */
export const getShift = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          statusCode: 401,
          message: 'Authentication required'
        }
      });
      return;
    }

    const shift = await shiftService.getShift(id, req.user.organizationId);

    res.status(200).json({
      success: true,
      data: shift
    });
  } catch (error: any) {
    if (error.message === 'SHIFT_NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: {
          statusCode: 404,
          message: 'Shift not found'
        }
      });
      return;
    }

    logger.error('Get shift error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while fetching shift'
      }
    });
  }
};

/**
 * Update shift
 * PUT /api/analytics/shift/:id
 */
export const updateShift = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { end, processed, paid, payRate, overtimePayRate } = req.body;

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          statusCode: 401,
          message: 'Authentication required'
        }
      });
      return;
    }

    const existingShift = await shiftService.getShift(id, req.user.organizationId);
    
    if (!existingShift) {
      res.status(404).json({
        success: false,
        error: {
          statusCode: 404,
          message: 'Shift not found'
        }
      });
      return;
    }

    const isAdmin = req.user.type === 'admin';
    const shiftEmployeeId = (existingShift.employeeId as any)._id 
      ? (existingShift.employeeId as any)._id.toString()
      : existingShift.employeeId.toString();
    const currentUserId = req.user._id.toString();
    const isOwner = shiftEmployeeId === currentUserId;

    if (!isAdmin && !isOwner) {
      res.status(403).json({
        success: false,
        error: {
          statusCode: 403,
          message: 'You can only update your own shifts'
        }
      });
      return;
    }

    if (!isAdmin && (processed !== undefined || paid !== undefined || payRate !== undefined || overtimePayRate !== undefined)) {
      res.status(403).json({
        success: false,
        error: {
          statusCode: 403,
          message: 'You can only update the end time of your shifts'
        }
      });
      return;
    }

    const shift = await shiftService.updateShift(
      id,
      { end, processed, paid, payRate, overtimePayRate },
      req.user.organizationId
    );

    res.status(200).json({
      success: true,
      data: shift
    });
  } catch (error: any) {
    if (error.message === 'SHIFT_NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: {
          statusCode: 404,
          message: 'Shift not found'
        }
      });
      return;
    }

    logger.error('Update shift error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while updating shift'
      }
    });
  }
};

/**
 * Delete shift
 * DELETE /api/analytics/shift/:id
 */
export const deleteShift = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          statusCode: 401,
          message: 'Authentication required'
        }
      });
      return;
    }

    await shiftService.deleteShift(id, req.user.organizationId);

    res.status(200).json({
      success: true,
      message: 'Shift deleted successfully'
    });
  } catch (error: any) {
    if (error.message === 'SHIFT_NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: {
          statusCode: 404,
          message: 'Shift not found'
        }
      });
      return;
    }

    logger.error('Delete shift error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while deleting shift'
      }
    });
  }
};

/**
 * End current active shift for employee
 * POST /api/analytics/shift/end
 */
export const endShift = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId, endTime } = req.body;

    if (!employeeId || !endTime) {
      res.status(422).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Employee ID and end time are required',
          details: [
            ...(!employeeId ? [{ field: 'employeeId', message: 'Employee ID is required' }] : []),
            ...(!endTime ? [{ field: 'endTime', message: 'End time is required' }] : [])
          ]
        }
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          statusCode: 401,
          message: 'Authentication required'
        }
      });
      return;
    }

    
    const shift = await shiftService.endShift(employeeId, req.user.organizationId, endTime);

    res.status(200).json({
      success: true,
      data: shift,
      message: 'Shift ended successfully'
    });
  } catch (error: any) {
    if (error.message === 'NO_ACTIVE_SHIFT') {
      res.status(404).json({
        success: false,
        error: {
          statusCode: 404,
          message: 'No active shift found for this employee'
        }
      });
      return;
    }

    logger.error('End shift error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while ending shift'
      }
    });
  }
};

/**
 * Mark shift as paid
 * PUT /api/analytics/shift/:id/paid
 */
export const markShiftAsPaid = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          statusCode: 401,
          message: 'Authentication required'
        }
      });
      return;
    }

    const shift = await shiftService.markAsPaid(id, req.user.organizationId);

    res.status(200).json({
      success: true,
      data: shift,
      message: 'Shift marked as paid successfully'
    });
  } catch (error: any) {
    if (error.message === 'SHIFT_NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: {
          statusCode: 404,
          message: 'Shift not found'
        }
      });
      return;
    }

    logger.error('Mark shift as paid error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while marking shift as paid'
      }
    });
  }
};

/**
 * Create a new screenshot
 * POST /api/analytics/screenshot
 */
export const createScreenshot = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;

    // Validate required fields
    if (!data.timestamp || !data.app || !data.user || !data.computer || !data.name || !data.hwid || !data.os || !data.employeeId || data.permission === undefined) {
      res.status(422).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Required fields are missing',
          details: [
            { field: 'timestamp', message: 'Timestamp is required' },
            { field: 'app', message: 'App name is required' },
            { field: 'permission', message: 'Permission flag is required' }
          ]
        }
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          statusCode: 401,
          message: 'Authentication required'
        }
      });
      return;
    }

    
    const screenshot = await screenshotService.createScreenshot(data, req.user.organizationId);

    res.status(201).json({
      success: true,
      data: screenshot
    });
  } catch (error: any) {
    if (error.message === 'EMPLOYEE_NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: {
          statusCode: 404,
          message: 'Employee not found'
        }
      });
      return;
    }

    logger.error('Create screenshot error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while creating screenshot'
      }
    });
  }
};

/**
 * List screenshots (Insightful API compatible)
 * GET /api/analytics/screenshot
 */
export const listScreenshots = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          statusCode: 401,
          message: 'Authentication required'
        }
      });
      return;
    }

    // Parse required query parameters
    const start = parseInt(req.query.start as string);
    const end = parseInt(req.query.end as string);

    if (!start || !end) {
      res.status(422).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Start and end timestamps are required'
        }
      });
      return;
    }

    // Parse optional filters
    const filters = {
      start,
      end,
      timezone: req.query.timezone as string,
      employeeId: req.query.employeeId as string,
      teamId: req.query.teamId as string,
      projectId: req.query.projectId as string,
      taskId: req.query.taskId as string,
      shiftId: req.query.shiftId as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 15
    };

    
    const screenshots = await screenshotService.listScreenshots(req.user.organizationId, filters);

    // Return array format (Insightful API compatible)
    res.status(200).json(screenshots);
  } catch (error) {
    logger.error('List screenshots error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while fetching screenshots'
      }
    });
  }
};

/**
 * Paginate screenshots (Insightful API compatible)
 * GET /api/analytics/screenshot-paginate
 */
export const paginateScreenshots = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          statusCode: 401,
          message: 'Authentication required'
        }
      });
      return;
    }

    // Parse required query parameters
    const start = parseInt(req.query.start as string);
    const end = parseInt(req.query.end as string);

    if (!start || !end) {
      res.status(422).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Start and end timestamps are required'
        }
      });
      return;
    }

    // Parse optional filters
    const filters = {
      start,
      end,
      timezone: req.query.timezone as string,
      employeeId: req.query.employeeId as string,
      teamId: req.query.teamId as string,
      projectId: req.query.projectId as string,
      taskId: req.query.taskId as string,
      shiftId: req.query.shiftId as string,
      sortBy: req.query.sortBy as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10000,
      next: req.query.next as string
    };

    
    const result = await screenshotService.paginateScreenshots(req.user.organizationId, filters);

    res.status(200).json(result);
  } catch (error) {
    logger.error('Paginate screenshots error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while fetching screenshots'
      }
    });
  }
};

/**
 * Get screenshot by ID
 * GET /api/analytics/screenshot/:id
 */
export const getScreenshot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          statusCode: 401,
          message: 'Authentication required'
        }
      });
      return;
    }

    
    const screenshot = await screenshotService.getScreenshot(id, req.user.organizationId);

    res.status(200).json({
      success: true,
      data: screenshot
    });
  } catch (error: any) {
    if (error.message === 'SCREENSHOT_NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: {
          statusCode: 404,
          message: 'Screenshot not found'
        }
      });
      return;
    }

    logger.error('Get screenshot error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while fetching screenshot'
      }
    });
  }
};

/**
 * Delete screenshot
 * DELETE /api/analytics/screenshot/:id
 */
export const deleteScreenshot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          statusCode: 401,
          message: 'Authentication required'
        }
      });
      return;
    }

    await screenshotService.deleteScreenshot(id, req.user.organizationId);

    res.status(200).json({
      success: true,
      message: 'Screenshot deleted successfully'
    });
  } catch (error: any) {
    if (error.message === 'SCREENSHOT_NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: {
          statusCode: 404,
          message: 'Screenshot not found'
        }
      });
      return;
    }

    logger.error('Delete screenshot error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while deleting screenshot'
      }
    });
  }
};

/**
 * Get screenshots with permission issues
 * GET /api/analytics/screenshot/permission-issues
 */
export const getScreenshotsWithPermissionIssues = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          statusCode: 401,
          message: 'Authentication required'
        }
      });
      return;
    }

    const start = parseInt(req.query.start as string);
    const end = parseInt(req.query.end as string);

    if (!start || !end) {
      res.status(422).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Start and end timestamps are required'
        }
      });
      return;
    }

    const screenshots = await screenshotService.getScreenshotsWithPermissionIssues(
      req.user.organizationId,
      start,
      end
    );

    res.status(200).json({
      success: true,
      data: screenshots
    });
  } catch (error) {
    logger.error('Get permission issues error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while fetching screenshots with permission issues'
      }
    });
  }
};

/**
 * Get screenshot statistics
 * GET /api/analytics/screenshot/stats
 */
export const getScreenshotStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          statusCode: 401,
          message: 'Authentication required'
        }
      });
      return;
    }

    const start = parseInt(req.query.start as string);
    const end = parseInt(req.query.end as string);

    if (!start || !end) {
      res.status(422).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Start and end timestamps are required'
        }
      });
      return;
    }

    const stats = await screenshotService.getScreenshotStats(
      req.user.organizationId,
      start,
      end
    );

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Get screenshot stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while fetching screenshot statistics'
      }
    });
  }
};

/**
 * List activities (Insightful API compatible)
 * GET /api/analytics/activity
 */
export const listActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          statusCode: 401,
          message: 'Authentication required'
        }
      });
      return;
    }

    const start = parseInt(req.query.start as string);
    const end = parseInt(req.query.end as string);

    if (!start || !end) {
      res.status(422).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Start and end timestamps are required'
        }
      });
      return;
    }

    const filters = {
      start,
      end,
      timezone: req.query.timezone as string,
      employeeId: req.query.employeeId as string,
      teamId: req.query.teamId as string,
      projectId: req.query.projectId as string,
      taskId: req.query.taskId as string,
      shiftId: req.query.shiftId as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
    };

    const activities = await activityService.listActivities(req.user.organizationId, filters);
    res.status(200).json(activities);
  } catch (error) {
    logger.error('List activities error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while fetching activities'
      }
    });
  }
};

/**
 * List breaks (Insightful API compatible)
 * GET /api/analytics/break
 */
export const listBreaks = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          statusCode: 401,
          message: 'Authentication required'
        }
      });
      return;
    }

    const start = parseInt(req.query.start as string);
    const end = parseInt(req.query.end as string);

    if (!start || !end) {
      res.status(422).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Start and end timestamps are required'
        }
      });
      return;
    }

    const filters = {
      start,
      end,
      timezone: req.query.timezone as string,
      employeeId: req.query.employeeId as string,
      teamId: req.query.teamId as string,
      projectId: req.query.projectId as string,
      taskId: req.query.taskId as string,
      shiftId: req.query.shiftId as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
    };

    const breaks = await breakService.listBreaks(req.user.organizationId, filters);

    res.status(200).json(breaks);
  } catch (error) {
    logger.error('List breaks error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while fetching breaks'
      }
    });
  }
};

/**
 * List project time (Insightful API compatible)
 * GET /api/analytics/project-time
 */
export const listProjectTime = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          statusCode: 401,
          message: 'Authentication required'
        }
      });
      return;
    }

    const start = parseInt(req.query.start as string);
    const end = parseInt(req.query.end as string);

    if (!start || !end) {
      res.status(422).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Start and end timestamps are required'
        }
      });
      return;
    }

    const filters = {
      start,
      end,
      timezone: req.query.timezone as string,
      employeeId: req.query.employeeId as string,
      teamId: req.query.teamId as string,
      projectId: req.query.projectId as string,
      taskId: req.query.taskId as string,
      shiftId: req.query.shiftId as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
    };

    const projectTime = await projectTimeService.listProjectTime(req.user.organizationId, filters);

    res.status(200).json(projectTime);
  } catch (error) {
    logger.error('List project time error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while fetching project time'
      }
    });
  }
};

/**
 * List manual entries (Insightful API compatible)
 * GET /api/analytics/manual-entry
 */
export const listManualEntries = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          statusCode: 401,
          message: 'Authentication required'
        }
      });
      return;
    }

    const start = parseInt(req.query.start as string);
    const end = parseInt(req.query.end as string);

    if (!start || !end) {
      res.status(422).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Start and end timestamps are required'
        }
      });
      return;
    }

    const filters = {
      start,
      end,
      timezone: req.query.timezone as string,
      employeeId: req.query.employeeId as string,
      teamId: req.query.teamId as string,
      projectId: req.query.projectId as string,
      taskId: req.query.taskId as string,
      shiftId: req.query.shiftId as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
    };

    const manualEntries = await manualEntryService.listManualEntries(req.user.organizationId, filters);

    res.status(200).json(manualEntries);
  } catch (error) {
    logger.error('List manual entries error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while fetching manual entries'
      }
    });
  }
};
