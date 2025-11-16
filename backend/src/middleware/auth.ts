import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, hashApiToken } from '../utils/jwt';
import User, { IUser } from '../models/User';
import Token from '../models/Token';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }  

  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          statusCode: 401,
          message: 'Authentication required'
        }
      });
      return;
    }
    
    try {
      const decoded = verifyAccessToken(token);
      
      const user = await User.findById(decoded.userId);
      
      if (!user || user.deactivated) {
        res.status(401).json({
          success: false,
          error: {
            statusCode: 401,
            message: 'User not found or deactivated'
          }
        });
        return;
      }
      
      req.user = user;
      return next();
    } catch (jwtError) {
      const hashedToken = hashApiToken(token);
      
      const apiToken = await Token.findOne({
        token: hashedToken,
        type: 'api',
        revoked: false
      });
      
      if (!apiToken) {
        res.status(401).json({
          success: false,
          error: {
            statusCode: 401,
            message: 'Invalid or expired token'
          }
        });
        return;
      }
      
      if (apiToken.expiresAt && apiToken.expiresAt < new Date()) {
        res.status(401).json({
          success: false,
          error: {
            statusCode: 401,
            message: 'Token expired'
          }
        });
        return;
      }
      
      apiToken.lastUsedAt = new Date();
      await apiToken.save();
      
      const user = await User.findById(apiToken.userId);
      
      if (!user || user.deactivated) {
        res.status(401).json({
          success: false,
          error: {
            statusCode: 401,
            message: 'User not found or deactivated'
          }
        });
        return;
      }
      
      req.user = user;
      return next();
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        message: 'Authentication error'
      }
    });
  }
};

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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
  
  next();
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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
  
  if (req.user.type !== 'admin') {
    res.status(403).json({
      success: false,
      error: {
        statusCode: 403,
        message: 'Admin access required'
      }
    });
    return;
  }
  
  next();
};

export const requireOrganization = (organizationIdParam: string = 'organizationId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
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
    
    const requestedOrgId = req.params[organizationIdParam] || req.body[organizationIdParam];
    
    if (requestedOrgId && requestedOrgId !== req.user.organizationId) {
      res.status(403).json({
        success: false,
        error: {
          statusCode: 403,
          message: 'Access denied to this organization'
        }
      });
      return;
    }
    
    next();
  };
};
