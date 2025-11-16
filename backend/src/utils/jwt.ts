import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';

export interface JWTPayload {
  userId: string;
  email: string;
  organizationId: string;
  type: 'personal' | 'admin';
  tokenType: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const generateAccessToken = (payload: Omit<JWTPayload, 'tokenType'>): string => {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
  const expiresIn = process.env.JWT_EXPIRES_IN || '15m';

  return jwt.sign(
    {
      ...payload,
      tokenType: 'access'
    },
    secret,
    { expiresIn } as SignOptions
  );
};

export const generateRefreshToken = (payload: Omit<JWTPayload, 'tokenType'>): string => {
  const secret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-this-in-production';
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  return jwt.sign(
    {
      ...payload,
      tokenType: 'refresh'
    },
    secret,
    { expiresIn } as SignOptions
  );
};

export const generateTokenPair = (payload: Omit<JWTPayload, 'tokenType'>): TokenPair => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
};

export const verifyAccessToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
  
  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;
    
    if (decoded.tokenType !== 'access') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-this-in-production';
  
  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;
    
    if (decoded.tokenType !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

export const generateApiToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};


export const hashApiToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};


export const verifyApiToken = (token: string, hashedToken: string): boolean => {
  const hash = hashApiToken(token);
  return hash === hashedToken;
};

export const decodeToken = (token: string): any => {
  return jwt.decode(token);
};

export const getTokenExpiry = (expiryString: string): Date => {
  const match = expiryString.match(/^(\d+)([smhd])$/);
  
  if (!match) {
    throw new Error('Invalid expiry format');
  }
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  const now = new Date();
  
  switch (unit) {
    case 's':
      return new Date(now.getTime() + value * 1000);
    case 'm':
      return new Date(now.getTime() + value * 60 * 1000);
    case 'h':
      return new Date(now.getTime() + value * 60 * 60 * 1000);
    case 'd':
      return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
    default:
      throw new Error('Invalid expiry unit');
  }
};
