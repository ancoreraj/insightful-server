import Project, { IProject } from '../models/Project';
import User from '../models/User';
import logger from '../utils/logger';

export interface CreateProjectData {
  name: string;
  archived?: boolean;
  statuses?: string[];
  priorities?: string[];
  billable?: boolean;
  payroll?: {
    billRate?: number;
    overtimeBillRate?: number;
  };
  employees?: string[];
  teams?: string[];
}

export interface UpdateProjectData {
  name?: string;
  archived?: boolean;
  statuses?: string[];
  priorities?: string[];
  billable?: boolean;
  payroll?: {
    billRate?: number;
    overtimeBillRate?: number;
  };
  employees?: string[];
}

export interface ListProjectsFilters {
  archived?: boolean;
  billable?: boolean;
  search?: string;
  employeeId?: string;
  creatorId?: string;
  limit?: number;
  skip?: number;
}

export class ProjectService {

  async createProject(data: CreateProjectData, creatorId: string, organizationId: string): Promise<IProject> {
    const { name, archived, statuses, priorities, billable, payroll, employees } = data;

    if (employees && employees.length > 0) {
      const employeeCount = await User.countDocuments({
        _id: { $in: employees },
        organizationId
      });

      if (employeeCount !== employees.length) {
        throw new Error('INVALID_EMPLOYEES');
      }
    }

    const project = await Project.create({
      name,
      archived: archived || false,
      statuses: statuses || [],
      priorities: priorities || [],
      billable: billable || false,
      payroll: payroll || {},
      employees: employees || [],
      creatorId,
      organizationId
    });

    logger.info(`Project created: ${name} by user ${creatorId}`);

    return project;
  }

  async getProject(projectId: string, organizationId: string): Promise<IProject> {
    const project = await Project.findOne({
      _id: projectId,
      organizationId
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    return project;
  }

  async listProjects(organizationId: string, filters: ListProjectsFilters = {}): Promise<any> {
    const {
      archived,
      billable,
      search,
      employeeId,
      creatorId,
      limit = 50,
      skip = 0
    } = filters;

    const query: any = { organizationId };

    if (typeof archived === 'boolean') {
      query.archived = archived;
    }

    if (typeof billable === 'boolean') {
      query.billable = billable;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (employeeId) {
      query.employees = employeeId;
    }

    if (creatorId) {
      query.creatorId = creatorId;
    }

    const [projects, total] = await Promise.all([
      Project.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      Project.countDocuments(query)
    ]);

    return {
      projects,
      total,
      limit,
      skip,
      hasMore: skip + projects.length < total
    };
  }

  async updateProject(
    projectId: string,
    data: UpdateProjectData,
    organizationId: string
  ): Promise<IProject> {
    const project = await Project.findOne({
      _id: projectId,
      organizationId
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    if (data.employees) {
      const employeeCount = await User.countDocuments({
        _id: { $in: data.employees },
        organizationId
      });

      if (employeeCount !== data.employees.length) {
        throw new Error('INVALID_EMPLOYEES');
      }
    }

    if (data.name !== undefined) project.name = data.name;
    if (data.archived !== undefined) project.archived = data.archived;
    if (data.statuses !== undefined) project.statuses = data.statuses;
    if (data.priorities !== undefined) project.priorities = data.priorities;
    if (data.billable !== undefined) project.billable = data.billable;
    if (data.payroll !== undefined) {
      project.payroll = {
        ...project.payroll,
        ...data.payroll
      };
    }
    if (data.employees !== undefined) project.employees = data.employees;

    await project.save();

    logger.info(`Project updated: ${project.name}`);

    return project;
  }

  async deleteProject(projectId: string, organizationId: string): Promise<void> {
    const project = await Project.findOne({
      _id: projectId,
      organizationId
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    project.archived = true;
    await project.save();

    logger.info(`Project archived: ${project.name}`);
  }

  async addEmployees(
    projectId: string,
    employeeIds: string[],
    organizationId: string
  ): Promise<IProject> {
    const project = await Project.findOne({
      _id: projectId,
      organizationId
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    const employees = await User.find({
      _id: { $in: employeeIds },
      organizationId
    });

    if (employees.length !== employeeIds.length) {
      throw new Error('INVALID_EMPLOYEES');
    }

    const currentEmployeeIds = project.employees.map(id => id.toString());
    const newEmployeeIds = employeeIds.filter(id => !currentEmployeeIds.includes(id));

    if (newEmployeeIds.length > 0) {
      project.employees.push(...newEmployeeIds);
      await project.save();

      await User.updateMany(
        { _id: { $in: newEmployeeIds } },
        { $addToSet: { projects: projectId } }
      );

      logger.info(`Added ${newEmployeeIds.length} employees to project: ${project.name}`);
    }

    return project;
  }

  async removeEmployee(
    projectId: string,
    employeeId: string,
    organizationId: string
  ): Promise<IProject> {
    const project = await Project.findOne({
      _id: projectId,
      organizationId
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    project.employees = project.employees.filter(id => id.toString() !== employeeId);
    await project.save();

    await User.updateOne(
      { _id: employeeId },
      { $pull: { projects: projectId } }
    );

    logger.info(`Removed employee ${employeeId} from project: ${project.name}`);

    return project;
  }

  async archiveProject(projectId: string, organizationId: string): Promise<IProject> {
    const project = await Project.findOne({
      _id: projectId,
      organizationId
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    project.archived = true;
    await project.save();

    logger.info(`Project archived: ${project.name}`);

    return project;
  }

  async unarchiveProject(projectId: string, organizationId: string): Promise<IProject> {
    const project = await Project.findOne({
      _id: projectId,
      organizationId
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    project.archived = false;
    await project.save();

    logger.info(`Project unarchived: ${project.name}`);

    return project;
  }

  async getEmployeeProjects(employeeId: string, organizationId: string): Promise<IProject[]> {
    const projects = await Project.find({
      organizationId,
      employees: employeeId,
      archived: false
    })
      .sort({ createdAt: -1 });

    return projects;
  }

  async validateProjectAccess(projectId: string, organizationId: string): Promise<boolean> {
    const project = await Project.findOne({
      _id: projectId,
      organizationId
    });

    return !!project;
  }
}

export default new ProjectService();
