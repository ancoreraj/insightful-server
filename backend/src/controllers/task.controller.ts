import { Request, Response } from 'express';
import taskService from '../services/task.service';
import logger from '../utils/logger';

/**
 * Create a new task
 * POST /api/task
 */
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      projectId,
      status,
      priority,
      billable,
      startDate,
      dueDate,
      estimatedHours,
      employeeId
    } = req.body;

    
    if (!name || !projectId) {
      res.status(422).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Task name and project ID are required',
          details: [
            ...(!name ? [{ field: 'name', message: 'Task name is required' }] : []),
            ...(!projectId ? [{ field: 'projectId', message: 'Project ID is required' }] : [])
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

    
    const task = await taskService.createTask(
      {
        name,
        description,
        projectId,
        status,
        priority,
        billable,
        startDate,
        dueDate,
        estimatedHours,
        employeeId
      },
      req.user._id,
      req.user.organizationId
    );

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error: any) {
    if (error.message === 'PROJECT_NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: {
          statusCode: 404,
          message: 'Project not found'
        }
      });
      return;
    }

    if (error.message === 'INVALID_EMPLOYEES') {
      res.status(400).json({
        success: false,
        error: {
          statusCode: 400,
          message: 'One or more employees are invalid or do not belong to your organization'
        }
      });
      return;
    }

    if (error.message === 'EMPLOYEES_NOT_IN_PROJECT') {
      res.status(400).json({
        success: false,
        error: {
          statusCode: 400,
          message: 'One or more employees are not assigned to this project. Please assign them to the project first.'
        }
      });
      return;
    }

    logger.error('Create task error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while creating task'
      }
    });
  }
};

/**
 * Create default task for a project
 * POST /api/task/default/:projectId
 */
export const createDefaultTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

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

    
    const task = await taskService.createDefaultTask(
      projectId,
      req.user._id,
      req.user.organizationId
    );

    res.status(201).json({
      success: true,
      data: task,
      message: 'Default task created successfully'
    });
  } catch (error: any) {
    if (error.message === 'PROJECT_NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: {
          statusCode: 404,
          message: 'Project not found'
        }
      });
      return;
    }

    logger.error('Create default task error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while creating default task'
      }
    });
  }
};

/**
 * Get task by ID
 * GET /api/task/:id
 */
export const getTask = async (req: Request, res: Response): Promise<void> => {
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

    
    const task = await taskService.getTask(id, req.user.organizationId);

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error: any) {
    if (error.message === 'TASK_NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: {
          statusCode: 404,
          message: 'Task not found'
        }
      });
      return;
    }

    logger.error('Get task error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while fetching task'
      }
    });
  }
};

/**
 * List tasks
 * GET /api/task
 */
export const listTasks = async (req: Request, res: Response): Promise<void> => {
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

    
    const filters = {
      projectId: req.query.projectId as string,
      employeeId: req.query.employeeId as string,
      status: req.query.status as string,
      priority: req.query.priority as string,
      billable: req.query.billable === 'true' ? true : req.query.billable === 'false' ? false : undefined,
      search: req.query.search as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      skip: req.query.skip ? parseInt(req.query.skip as string) : 0
    };

    
    const result = await taskService.listTasks(req.user.organizationId, filters);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('List tasks error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while fetching tasks'
      }
    });
  }
};

/**
 * Update task
 * PUT /api/task/:id
 */
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      status,
      priority,
      billable,
      startDate,
      dueDate,
      estimatedHours,
      employeeId
    } = req.body;

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

    
    const task = await taskService.updateTask(
      id,
      {
        name,
        description,
        status,
        priority,
        billable,
        startDate,
        dueDate,
        estimatedHours,
        employeeId
      },
      req.user.organizationId
    );

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error: any) {
    if (error.message === 'TASK_NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: {
          statusCode: 404,
          message: 'Task not found'
        }
      });
      return;
    }

    if (error.message === 'INVALID_EMPLOYEE') {
      res.status(400).json({
        success: false,
        error: {
          statusCode: 400,
          message: 'Employee is invalid or does not belong to your organization'
        }
      });
      return;
    }

    if (error.message === 'EMPLOYEE_NOT_IN_PROJECT') {
      res.status(400).json({
        success: false,
        error: {
          statusCode: 400,
          message: 'Employee is not assigned to this project. Please assign them to the project first.'
        }
      });
      return;
    }

    logger.error('Update task error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while updating task'
      }
    });
  }
};

/**
 * Delete task
 * DELETE /api/task/:id
 */
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
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

    
    await taskService.deleteTask(id, req.user.organizationId);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error: any) {
    if (error.message === 'TASK_NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: {
          statusCode: 404,
          message: 'Task not found'
        }
      });
      return;
    }

    if (error.message === 'CANNOT_DELETE_DEFAULT_TASK') {
      res.status(400).json({
        success: false,
        error: {
          statusCode: 400,
          message: 'Cannot delete the default task'
        }
      });
      return;
    }

    logger.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while deleting task'
      }
    });
  }
};

/**
 * Assign employee to task
 * PUT /api/task/:id/employee
 */
export const assignEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { employeeId } = req.body;

    if (!employeeId) {
      res.status(422).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Employee ID is required',
          details: [{ field: 'employeeId', message: 'Employee ID is required' }]
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

    
    const task = await taskService.assignEmployee(id, employeeId, req.user.organizationId);

    res.status(200).json({
      success: true,
      data: task,
      message: 'Employee assigned to task successfully'
    });
  } catch (error: any) {
    if (error.message === 'TASK_NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: {
          statusCode: 404,
          message: 'Task not found'
        }
      });
      return;
    }

    if (error.message === 'INVALID_EMPLOYEE') {
      res.status(400).json({
        success: false,
        error: {
          statusCode: 400,
          message: 'Employee is invalid or does not belong to your organization'
        }
      });
      return;
    }

    if (error.message === 'EMPLOYEE_NOT_IN_PROJECT') {
      res.status(400).json({
        success: false,
        error: {
          statusCode: 400,
          message: 'Employee is not assigned to this project'
        }
      });
      return;
    }

    logger.error('Assign employee error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while assigning employee to task'
      }
    });
  }
};

/**
 * Unassign employee from task
 * DELETE /api/task/:id/employee
 */
export const unassignEmployee = async (req: Request, res: Response): Promise<void> => {
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

    
    const task = await taskService.unassignEmployee(id, req.user.organizationId);

    res.status(200).json({
      success: true,
      data: task,
      message: 'Employee unassigned from task successfully'
    });
  } catch (error: any) {
    if (error.message === 'TASK_NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: {
          statusCode: 404,
          message: 'Task not found'
        }
      });
      return;
    }

    logger.error('Unassign employee error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while unassigning employee from task'
      }
    });
  }
};

