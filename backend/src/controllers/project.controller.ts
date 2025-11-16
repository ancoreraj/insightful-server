import { Request, Response } from 'express';
import projectService from '../services/project.service';
import logger from '../utils/logger';

/**
 * Create a new project
 * POST /api/project
 */
export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, archived, statuses, priorities, billable, payroll, employees, teams } = req.body;

    
    if (!name) {
      res.status(422).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Project name is required',
          details: [{ field: 'name', message: 'Project name is required' }]
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

    
    const project = await projectService.createProject(
      { name, archived, statuses, priorities, billable, payroll, employees, teams },
      req.user._id,
      req.user.organizationId
    );

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error: any) {
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

    if (error.message === 'INVALID_TEAMS') {
      res.status(400).json({
        success: false,
        error: {
          statusCode: 400,
          message: 'One or more teams are invalid or do not belong to your organization'
        }
      });
      return;
    }

    logger.error('Create project error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while creating project'
      }
    });
  }
};

/**
 * Get project by ID
 * GET /api/project/:id
 */
export const getProject = async (req: Request, res: Response): Promise<void> => {
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

    
    const project = await projectService.getProject(id, req.user.organizationId);

    res.status(200).json({
      success: true,
      data: project
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

    logger.error('Get project error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while fetching project'
      }
    });
  }
};

/**
 * List projects
 * GET /api/project
 */
export const listProjects = async (req: Request, res: Response): Promise<void> => {
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
      archived: req.query.archived === 'true' ? true : req.query.archived === 'false' ? false : undefined,
      billable: req.query.billable === 'true' ? true : req.query.billable === 'false' ? false : undefined,
      search: req.query.search as string,
      employeeId: req.query.employeeId as string,
      teamId: req.query.teamId as string,
      creatorId: req.query.creatorId as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      skip: req.query.skip ? parseInt(req.query.skip as string) : 0
    };

    
    const result = await projectService.listProjects(req.user.organizationId, filters);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('List projects error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while fetching projects'
      }
    });
  }
};

/**
 * Update project
 * PUT /api/project/:id
 */
export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, archived, statuses, priorities, billable, payroll, employees } = req.body;

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

    
    const project = await projectService.updateProject(
      id,
      { name, archived, statuses, priorities, billable, payroll, employees },
      req.user.organizationId
    );

    res.status(200).json({
      success: true,
      data: project
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

    if (error.message === 'INVALID_TEAMS') {
      res.status(400).json({
        success: false,
        error: {
          statusCode: 400,
          message: 'One or more teams are invalid or do not belong to your organization'
        }
      });
      return;
    }

    logger.error('Update project error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while updating project'
      }
    });
  }
};

/**
 * Delete project (archive)
 * DELETE /api/project/:id
 */
export const deleteProject = async (req: Request, res: Response): Promise<void> => {
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

    
    await projectService.deleteProject(id, req.user.organizationId);

    res.status(200).json({
      success: true,
      message: 'Project archived successfully'
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

    logger.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while deleting project'
      }
    });
  }
};

/**
 * Add employees to project
 * POST /api/project/:id/employees
 */
export const addEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { employeeIds } = req.body;

    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      res.status(422).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Employee IDs array is required',
          details: [{ field: 'employeeIds', message: 'Employee IDs array is required' }]
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

    
    const project = await projectService.addEmployees(id, employeeIds, req.user.organizationId);

    res.status(200).json({
      success: true,
      data: project,
      message: 'Employees added to project successfully'
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

    logger.error('Add employees error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while adding employees to project'
      }
    });
  }
};

/**
 * Remove employee from project
 * DELETE /api/project/:id/employees/:employeeId
 */
export const removeEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, employeeId } = req.params;

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

    
    const project = await projectService.removeEmployee(id, employeeId, req.user.organizationId);

    res.status(200).json({
      success: true,
      data: project,
      message: 'Employee removed from project successfully'
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

    logger.error('Remove employee error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while removing employee from project'
      }
    });
  }
};

/**
 * Archive project
 * PUT /api/project/:id/archive
 */
export const archiveProject = async (req: Request, res: Response): Promise<void> => {
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

    const project = await projectService.archiveProject(id, req.user.organizationId);

    res.status(200).json({
      success: true,
      data: project,
      message: 'Project archived successfully'
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

    logger.error('Archive project error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while archiving project'
      }
    });
  }
};

/**
 * Unarchive project
 * PUT /api/project/:id/unarchive
 */
export const unarchiveProject = async (req: Request, res: Response): Promise<void> => {
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

    
    const project = await projectService.unarchiveProject(id, req.user.organizationId);

    res.status(200).json({
      success: true,
      data: project,
      message: 'Project unarchived successfully'
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

    logger.error('Unarchive project error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while unarchiving project'
      }
    });
  }
};
