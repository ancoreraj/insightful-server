import { Request, Response } from 'express';
import authService from '../services/auth.service';
import employeeService from '../services/employee.service';
import { generateTokenPair } from '../utils/jwt';
import logger from '../utils/logger';

/**
 * Login with email and password
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(422).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Email and password are required',
          details: [
            ...(!email ? [{ field: 'email', message: 'Email is required' }] : []),
            ...(!password ? [{ field: 'password', message: 'Password is required' }] : [])
          ]
        }
      });
      return;
    }

    
    const result = await authService.login({ email, password });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    if (error.message === 'INVALID_CREDENTIALS') {
      res.status(401).json({
        success: false,
        error: {
          statusCode: 401,
          message: 'Invalid email or password'
        }
      });
      return;
    }

    if (error.message === 'ACCOUNT_DEACTIVATED') {
      res.status(401).json({
        success: false,
        error: {
          statusCode: 401,
          message: 'Account has been deactivated'
        }
      });
      return;
    }

    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred during login'
      }
    });
  }
};

/**
 * Refresh access token using refresh token
 * POST /api/auth/refresh
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(422).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Refresh token is required',
          details: [{ field: 'refreshToken', message: 'Refresh token is required' }]
        }
      });
      return;
    }

    
    const result = await authService.refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    if (error.message === 'INVALID_REFRESH_TOKEN') {
      res.status(401).json({
        success: false,
        error: {
          statusCode: 401,
          message: 'Invalid or expired refresh token'
        }
      });
      return;
    }

    if (error.message === 'REFRESH_TOKEN_NOT_FOUND') {
      res.status(401).json({
        success: false,
        error: {
          statusCode: 401,
          message: 'Refresh token not found or has been revoked'
        }
      });
      return;
    }

    if (error.message === 'REFRESH_TOKEN_EXPIRED') {
      res.status(401).json({
        success: false,
        error: {
          statusCode: 401,
          message: 'Refresh token has expired'
        }
      });
      return;
    }

    if (error.message === 'USER_NOT_FOUND') {
      res.status(401).json({
        success: false,
        error: {
          statusCode: 401,
          message: 'User not found or deactivated'
        }
      });
      return;
    }

    logger.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while refreshing token'
      }
    });
  }
};

/**
 * Logout user by revoking refresh token
 * POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(422).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Refresh token is required',
          details: [{ field: 'refreshToken', message: 'Refresh token is required' }]
        }
      });
      return;
    }

    
    await authService.logout(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred during logout'
      }
    });
  }
};

/**
 * Generate API token (Admin only)
 * POST /api/auth/api-token
 */
export const createApiToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, expiresIn } = req.body;

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

    if (!name) {
      res.status(422).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Token name is required',
          details: [{ field: 'name', message: 'Token name is required' }]
        }
      });
      return;
    }

    
    const result = await authService.createApiToken(req.user._id, name, expiresIn);

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Create API token error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while creating API token'
      }
    });
  }
};

/**
 * List user's API tokens
 * GET /api/auth/api-tokens
 */
export const listApiTokens = async (req: Request, res: Response): Promise<void> => {
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

    
    const tokens = await authService.listApiTokens(req.user._id);

    res.status(200).json({
      success: true,
      data: tokens
    });
  } catch (error) {
    logger.error('List API tokens error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while fetching API tokens'
      }
    });
  }
};

/**
 * Revoke API token
 * DELETE /api/auth/api-token/:id
 */
export const revokeApiToken = async (req: Request, res: Response): Promise<void> => {
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

    
    await authService.revokeApiToken(req.user._id, id);

    res.status(200).json({
      success: true,
      message: 'API token revoked successfully'
    });
  } catch (error: any) {
    if (error.message === 'TOKEN_NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: {
          statusCode: 404,
          message: 'API token not found'
        }
      });
      return;
    }

    logger.error('Revoke API token error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while revoking API token'
      }
    });
  }
};

/**
 * Setup account after invitation
 * POST /api/auth/setup-account
 */
export const setupAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password, passwordConfirm } = req.body;

    if (!token || !password || !passwordConfirm) {
      res.status(422).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Token, password, and password confirmation are required',
          details: [
            ...(!token ? [{ field: 'token', message: 'Invitation token is required' }] : []),
            ...(!password ? [{ field: 'password', message: 'Password is required' }] : []),
            ...(!passwordConfirm ? [{ field: 'passwordConfirm', message: 'Password confirmation is required' }] : [])
          ]
        }
      });
      return;
    }

    if (password !== passwordConfirm) {
      res.status(422).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Passwords do not match',
          details: [{ field: 'passwordConfirm', message: 'Passwords do not match' }]
        }
      });
      return;
    }

    if (password.length < 8) {
      res.status(422).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Password must be at least 8 characters long',
          details: [{ field: 'password', message: 'Password must be at least 8 characters long' }]
        }
      });
      return;
    }

    const user = await employeeService.completeInvitation(token, password);

    const tokenPayload = {
      userId: user._id,
      email: user.email,
      organizationId: user.organizationId,
      type: user.type
    };

    const tokens = generateTokenPair(tokenPayload);

    res.status(200).json({
      success: true,
      data: {
        user,
        ...tokens,
        expiresIn: process.env.JWT_EXPIRES_IN,
        message: 'Account setup completed successfully'
      }
    });
  } catch (error: any) {
    if (error.message === 'INVALID_INVITATION_TOKEN') {
      res.status(401).json({
        success: false,
        error: {
          statusCode: 401,
          message: 'Invalid invitation token'
        }
      });
      return;
    }

    if (error.message === 'INVITATION_TOKEN_EXPIRED') {
      res.status(401).json({
        success: false,
        error: {
          statusCode: 401,
          message: 'Invitation token has expired'
        }
      });
      return;
    }

    if (error.message === 'USER_NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: {
          statusCode: 404,
          message: 'User not found'
        }
      });
      return;
    }

    logger.error('Setup account error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'An error occurred while setting up account'
      }
    });
  }
};
