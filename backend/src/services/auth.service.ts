import User, { IUser } from '../models/User';
import Token from '../models/Token';
import {
  generateTokenPair,
  verifyRefreshToken,
  generateApiToken,
  hashApiToken,
  getTokenExpiry
} from '../utils/jwt';
import logger from '../utils/logger';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    type: 'personal' | 'admin';
    organizationId: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: string;
}

export interface ApiTokenData {
  token: string;
  name: string;
  expiresAt?: Date;
  message: string;
}

export class AuthService {

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { email, password } = credentials;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    if (user.deactivated) {
      throw new Error('ACCOUNT_DEACTIVATED');
    }
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const tokenPayload = {
      userId: user._id,
      email: user.email,
      organizationId: user.organizationId,
      type: user.type
    };

    const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

    const refreshTokenExpiry = getTokenExpiry(process.env.JWT_REFRESH_EXPIRES_IN || '7d');
    
    await Token.create({
      userId: user._id,
      token: hashApiToken(refreshToken),
      type: 'refresh',
      expiresAt: refreshTokenExpiry
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        type: user.type,
        organizationId: user.organizationId
      },
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    };
  }

  async refreshAccessToken(refreshTokenString: string): Promise<RefreshTokenResponse> {
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshTokenString);
    } catch (error) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }
    const hashedToken = hashApiToken(refreshTokenString);
    const storedToken = await Token.findOne({
      token: hashedToken,
      type: 'refresh',
      revoked: false
    });

    if (!storedToken) {
      throw new Error('REFRESH_TOKEN_NOT_FOUND');
    }

    if (storedToken.expiresAt && storedToken.expiresAt < new Date()) {
      throw new Error('REFRESH_TOKEN_EXPIRED');
    }
    const user = await User.findById(decoded.userId);

    if (!user || user.deactivated) {
      throw new Error('USER_NOT_FOUND');
    }

    const tokenPayload = {
      userId: user._id,
      email: user.email,
      organizationId: user.organizationId,
      type: user.type
    };

    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(tokenPayload);

    if (process.env.REFRESH_TOKEN_ROTATION === 'true') {
      storedToken.revoked = true;
      await storedToken.save();

      const refreshTokenExpiry = getTokenExpiry(process.env.JWT_REFRESH_EXPIRES_IN || '7d');
      
      await Token.create({
        userId: user._id,
        token: hashApiToken(newRefreshToken),
        type: 'refresh',
        expiresAt: refreshTokenExpiry
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m'
      };
    } else {
      return {
        accessToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m'
      };
    }
  }

  async logout(refreshTokenString: string): Promise<void> {
    const hashedToken = hashApiToken(refreshTokenString);
    const storedToken = await Token.findOne({
      token: hashedToken,
      type: 'refresh'
    });

    if (storedToken) {
      storedToken.revoked = true;
      await storedToken.save();
      logger.info('User logged out');
    }
  }
  
  async createApiToken(userId: string, name: string, expiresIn?: string): Promise<ApiTokenData> {
    const apiToken = generateApiToken();
    const hashedToken = hashApiToken(apiToken);

    let expiresAt: Date | undefined;
    if (expiresIn && expiresIn !== 'never') {
      expiresAt = getTokenExpiry(expiresIn);
    }
    await Token.create({
      userId,
      token: hashedToken,
      type: 'api',
      name,
      expiresAt
    });

    const user = await User.findById(userId);
    logger.info(`API token created: ${name} for user ${user?.email}`);

    return {
      token: apiToken,
      name,
      expiresAt,
      message: 'Store this token securely. You will not be able to see it again.'
    };
  }

  async listApiTokens(userId: string): Promise<any[]> {
    const tokens = await Token.find({
      userId,
      type: 'api',
      revoked: false
    }).select('-token').sort({ createdAt: -1 });

    return tokens;
  }

  async revokeApiToken(userId: string, tokenId: string): Promise<void> {
    const token = await Token.findOne({
      _id: tokenId,
      userId,
      type: 'api'
    });

    if (!token) {
      throw new Error('TOKEN_NOT_FOUND');
    }

    token.revoked = true;
    await token.save();

    const user = await User.findById(userId);
    logger.info(`API token revoked: ${token.name} for user ${user?.email}`);
  }

  async validateUser(userId: string): Promise<IUser> {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    if (user.deactivated) {
      throw new Error('USER_DEACTIVATED');
    }

    return user;
  }
}

export default new AuthService();
