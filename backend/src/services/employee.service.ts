import User, { IUser } from '../models/User';
import Token from '../models/Token';
import crypto from 'crypto';
import logger from '../utils/logger';

export interface InviteEmployeeData {
  name: string;
  email: string;
  sharedSettingsId?: string;
  type?: 'personal' | 'admin';
  projects?: string[];
}

export interface UpdateEmployeeData {
  name?: string;
  sharedSettingsId?: string;
  projects?: string[];
  type?: 'personal' | 'admin';
}

export interface ListEmployeesFilters {
  deactivated?: boolean;
  type?: 'personal' | 'admin';
  search?: string;
  limit?: number;
  skip?: number;
}

export class EmployeeService {
  async inviteEmployee(data: InviteEmployeeData, adminUser: IUser): Promise<any> {
    const { name, email, sharedSettingsId, type, projects } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    const tempPassword = crypto.randomBytes(16).toString('hex');

    const user = await User.create({
      name,
      email,
      password: tempPassword,
      organizationId: adminUser.organizationId,
      sharedSettingsId,
      type: type || 'personal',
      projects: projects || [],
      invited: Date.now(),
      deactivated: false,
      identifier: email,
      accountId: adminUser.organizationId
    });

    const invitationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(invitationToken).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await Token.create({
      userId: user._id,
      token: hashedToken,
      type: 'invitation',
      name: 'Employee Invitation',
      expiresAt
    });

    logger.info(`Employee invited: ${email} by ${adminUser.email}`);
    const userObject = user.toJSON();

    return {
      ...userObject,
      invitationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/setup-account?token=${invitationToken}`,
      message: 'Employee invited successfully. Invitation email sent.'
    };
  }

  async getEmployee(employeeId: string, organizationId: string): Promise<IUser> {
    const employee = await User.findOne({
      _id: employeeId,
      organizationId
    });

    if (!employee) {
      throw new Error('EMPLOYEE_NOT_FOUND');
    }

    return employee;
  }

  async listEmployees(organizationId: string, filters: ListEmployeesFilters = {}): Promise<any> {
    const {
      deactivated,
      type,
      search,
      limit = 50,
      skip = 0
    } = filters;

    const query: any = { organizationId };

    if (deactivated !== undefined) {
      query.deactivated = deactivated;
    }

    if (type) {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const [employees, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      User.countDocuments(query)
    ]);

    return {
      employees,
      total,
      limit,
      skip,
      hasMore: skip + employees.length < total
    };
  }

  async updateEmployee(
    employeeId: string,
    data: UpdateEmployeeData,
    organizationId: string
  ): Promise<IUser> {
    const employee = await User.findOne({
      _id: employeeId,
      organizationId
    });

    if (!employee) {
      throw new Error('EMPLOYEE_NOT_FOUND');
    }

    if (data.name !== undefined) employee.name = data.name;
    if (data.sharedSettingsId !== undefined) employee.sharedSettingsId = data.sharedSettingsId;
    if (data.projects !== undefined) employee.projects = data.projects;
    if (data.type !== undefined) employee.type = data.type;

    await employee.save();

    logger.info(`Employee updated: ${employee.email}`);

    return employee;
  }

  async deactivateEmployee(employeeId: string, organizationId: string): Promise<void> {
    const employee = await User.findOne({
      _id: employeeId,
      organizationId
    });

    if (!employee) {
      throw new Error('EMPLOYEE_NOT_FOUND');
    }

    employee.deactivated = true;
    await employee.save();

    await Token.updateMany(
      { userId: employeeId },
      { $set: { revoked: true } }
    );

    logger.info(`Employee deactivated: ${employee.email}`);
  }

  async reactivateEmployee(employeeId: string, organizationId: string): Promise<IUser> {
    const employee = await User.findOne({
      _id: employeeId,
      organizationId
    });

    if (!employee) {
      throw new Error('EMPLOYEE_NOT_FOUND');
    }

    employee.deactivated = false;
    await employee.save();

    logger.info(`Employee reactivated: ${employee.email}`);

    return employee;
  }

  async completeInvitation(invitationToken: string, password: string): Promise<any> {
    const hashedToken = crypto.createHash('sha256').update(invitationToken).digest('hex');

    const token = await Token.findOne({
      token: hashedToken,
      type: 'invitation',
      revoked: false
    });

    if (!token) {
      throw new Error('INVALID_INVITATION_TOKEN');
    }

    if (token.expiresAt && token.expiresAt < new Date()) {
      throw new Error('INVITATION_TOKEN_EXPIRED');
    }

    const user = await User.findById(token.userId).select('+password');

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    user.password = password;
    await user.save();

    token.revoked = true;
    await token.save();

    logger.info(`Account setup completed for: ${user.email}`);

    return user.toJSON();
  }
  async validateEmployeeAccess(
    employeeId: string,
    organizationId: string
  ): Promise<boolean> {
    const employee = await User.findOne({
      _id: employeeId,
      organizationId
    });

    return !!employee;
  }
}

export default new EmployeeService();
