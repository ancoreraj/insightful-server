import { Request, Response } from 'express';
import employeeService from '../services/employee.service';
import logger from '../utils/logger';

/**
 * Create/Invite a new employee
 * POST /api/employee
 */
export const createEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, sharedSettingsId, type, projects } = req.body;

    if (!name || !email) {
      res.status(422).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Name and email are required',
          details: [
            ...(!name ? [{ field: 'name', message: 'Name is required' }] : []),
            ...(!email ? [{ field: 'email', message: 'Email is required' }] : [])
          ]
        }
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(422).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Invalid email format',
          details: [{ field: 'email', message: 'Invalid email format' }]
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

    
    const result = await employeeService.inviteEmployee(
      { name, email, sharedSettingsId, type, projects },
      req.user
    );

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    if (error.message === 'EMAIL_ALREADY_EXISTS') {
      res.status(409).json({
        success: false,
        error: {
          statusCode: 409,
          message: 'Employee with this email already exists'
        }
      });
      return;
    }

    logger.error('Create employee error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while creating employee'
      }
    });
  }
};

/**
 * Get employee by ID
 * GET /api/employee/:id
 */
export const getEmployee = async (req: Request, res: Response): Promise<void> => {
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

    
    const employee = await employeeService.getEmployee(id, req.user.organizationId);

    res.status(200).json({
      success: true,
      data: employee
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

    logger.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while fetching employee'
      }
    });
  }
};

/**
 * Update employee
 * PUT /api/employee/:id
 */
export const updateEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, sharedSettingsId, projects, type } = req.body;

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

    
    const employee = await employeeService.updateEmployee(
      id,
      { name, sharedSettingsId, projects, type },
      req.user.organizationId
    );

    res.status(200).json({
      success: true,
      data: employee
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

    logger.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while updating employee'
      }
    });
  }
};

/**
 * List employees
 * GET /api/employee
 */
export const listEmployees = async (req: Request, res: Response): Promise<void> => {
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
      deactivated: req.query.deactivated === 'true',
      type: req.query.type as 'personal' | 'admin',
      search: req.query.search as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      skip: req.query.skip ? parseInt(req.query.skip as string) : 0
    };

    
    const result = await employeeService.listEmployees(req.user.organizationId, filters);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('List employees error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while fetching employees ' + error
      }
    });
  }
};

/**
 * Deactivate employee
 * DELETE /api/employee/:id
 */
export const deactivateEmployee = async (req: Request, res: Response): Promise<void> => {
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

    if (id === req.user._id.toString()) {
      res.status(400).json({
        success: false,
        error: {
          statusCode: 400,
          message: 'You cannot deactivate your own account'
        }
      });
      return;
    }

    
    await employeeService.deactivateEmployee(id, req.user.organizationId);

    res.status(200).json({
      success: true,
      message: 'Employee deactivated successfully'
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

    logger.error('Deactivate employee error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while deactivating employee' + error
      }
    });
  }
};

/**
 * Reactivate employee
 * PUT /api/employee/:id/reactivate
 */
export const reactivateEmployee = async (req: Request, res: Response): Promise<void> => {
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

    
    const employee = await employeeService.reactivateEmployee(id, req.user.organizationId);

    res.status(200).json({
      success: true,
      data: employee,
      message: 'Employee reactivated successfully'
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

    logger.error('Reactivate employee error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while reactivating employee'
      }
    });
  }
};
