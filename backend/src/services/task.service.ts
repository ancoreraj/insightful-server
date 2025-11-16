import Task, { ITask } from '../models/Task';
import Project from '../models/Project';
import User from '../models/User';
import logger from '../utils/logger';

export interface CreateTaskData {
  name: string;
  description?: string;
  projectId: string;
  status?: string;
  priority?: string;
  billable?: boolean;
  startDate?: Date;
  dueDate?: Date;
  estimatedHours?: number;
  employeeId?: string;
}

export interface UpdateTaskData {
  name?: string;
  description?: string;
  status?: string;
  priority?: string;
  billable?: boolean;
  startDate?: Date;
  dueDate?: Date;
  estimatedHours?: number;
  employeeId?: string;
}

export interface ListTasksFilters {
  projectId?: string;
  employeeId?: string;
  status?: string;
  priority?: string;
  billable?: boolean;
  search?: string;
  limit?: number;
  skip?: number;
}

export class TaskService {
  async createTask(data: CreateTaskData, creatorId: string, organizationId: string): Promise<ITask> {
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
    } = data;

    const project = await Project.findOne({
      _id: projectId,
      organizationId
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    if (employeeId) {
      const employee = await User.findOne({
        _id: employeeId,
        organizationId
      });

      if (!employee) {
        throw new Error('INVALID_EMPLOYEE');
      }

      const projectEmployeeIds = project.employees.map(id => id.toString());
      if (!projectEmployeeIds.includes(employeeId.toString())) {
        throw new Error('EMPLOYEE_NOT_IN_PROJECT');
      }
    }

    const task = await Task.create({
      name,
      description,
      projectId,
      status: status || 'To Do',
      priority: priority || 'Medium',
      billable: billable !== undefined ? billable : project.billable,
      startDate,
      dueDate,
      estimatedHours,
      employeeId,
      creatorId,
      organizationId
    });

    logger.info(`Task created: ${name} for project ${projectId}`);

    return task;
  }

  async createDefaultTask(projectId: string, creatorId: string, organizationId: string): Promise<ITask> {
    const existingDefaultTask = await Task.findOne({
      projectId,
      organizationId,
      name: 'Default Task'
    });

    if (existingDefaultTask) {
      return existingDefaultTask;
    }

    const project = await Project.findOne({
      _id: projectId,
      organizationId
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    const task = await Task.create({
      name: 'Default Task',
      description: 'Default task for time tracking',
      projectId,
      status: 'Active',
      priority: 'Medium',
      billable: project.billable,
      creatorId,
      organizationId
    });

    return task;
  }


  async getTask(taskId: string, organizationId: string): Promise<ITask> {
    const task = await Task.findOne({
      _id: taskId,
      organizationId
    });

    if (!task) {
      throw new Error('TASK_NOT_FOUND');
    }

    return task;
  }

  async listTasks(organizationId: string, filters: ListTasksFilters = {}): Promise<any> {
    const {
      projectId,
      employeeId,
      status,
      priority,
      billable,
      search,
      limit = 50,
      skip = 0
    } = filters;

    const query: any = { organizationId };

    if (projectId) {
      query.projectId = projectId;
    }

    if (employeeId) {
      query.employeeId = employeeId;
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (typeof billable === 'boolean') {
      query.billable = billable;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      Task.countDocuments(query)
    ]);

    return {
      tasks,
      total,
      limit,
      skip,
      hasMore: skip + tasks.length < total
    };
  }

  async updateTask(
    taskId: string,
    data: UpdateTaskData,
    organizationId: string
  ): Promise<ITask> {
    const task = await Task.findOne({
      _id: taskId,
      organizationId
    });

    if (!task) {
      throw new Error('TASK_NOT_FOUND');
    }

    if (data.employeeId !== undefined) {
      if (data.employeeId) {
        const employee = await User.findOne({
          _id: data.employeeId,
          organizationId
        });

        if (!employee) {
          throw new Error('INVALID_EMPLOYEE');
        }

        const project = await Project.findOne({
          _id: task.projectId,
          organizationId
        });

        if (!project) {
          throw new Error('PROJECT_NOT_FOUND');
        }

        const projectEmployeeIds = project.employees.map(id => id.toString());
        if (!projectEmployeeIds.includes(data.employeeId.toString())) {
          throw new Error('EMPLOYEE_NOT_IN_PROJECT');
        }
      }
    }

    if (data.name !== undefined) task.name = data.name;
    if (data.description !== undefined) task.description = data.description;
    if (data.status !== undefined) task.status = data.status;
    if (data.priority !== undefined) task.priority = data.priority;
    if (data.billable !== undefined) task.billable = data.billable;
    if (data.startDate !== undefined) task.startDate = data.startDate;
    if (data.dueDate !== undefined) task.dueDate = data.dueDate;
    if (data.estimatedHours !== undefined) task.estimatedHours = data.estimatedHours;
    if (data.employeeId !== undefined) task.employeeId = data.employeeId;

    await task.save();

    logger.info(`Task updated: ${task.name}`);

    return task;
  }

  async deleteTask(taskId: string, organizationId: string): Promise<void> {
    const task = await Task.findOne({
      _id: taskId,
      organizationId
    });

    if (!task) {
      throw new Error('TASK_NOT_FOUND');
    }

    if (task.name === 'Default Task') {
      throw new Error('CANNOT_DELETE_DEFAULT_TASK');
    }

    await task.deleteOne();

    logger.info(`Task deleted: ${task.name}`);
  }

  async assignEmployee(
    taskId: string,
    employeeId: string,
    organizationId: string
  ): Promise<ITask> {
    const task = await Task.findOne({
      _id: taskId,
      organizationId
    });

    if (!task) {
      throw new Error('TASK_NOT_FOUND');
    }

    const employee = await User.findOne({
      _id: employeeId,
      organizationId
    });

    if (!employee) {
      throw new Error('INVALID_EMPLOYEE');
    }

    const project = await Project.findOne({
      _id: task.projectId,
      organizationId
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    const projectEmployeeIds = project.employees.map((id: any) => id.toString());
    if (!projectEmployeeIds.includes(employeeId.toString())) {
      throw new Error('EMPLOYEE_NOT_IN_PROJECT');
    }

    task.employeeId = employeeId;
    await task.save();

    logger.info(`Assigned employee ${employeeId} to task: ${task.name}`);

    return task;
  }

  async unassignEmployee(
    taskId: string,
    organizationId: string
  ): Promise<ITask> {
    const task = await Task.findOne({
      _id: taskId,
      organizationId
    });

    if (!task) {
      throw new Error('TASK_NOT_FOUND');
    }

    task.employeeId = undefined;
    await task.save();

    logger.info(`Unassigned employee from task: ${task.name}`);

    return task;
  }

  async getProjectTasks(projectId: string, organizationId: string): Promise<ITask[]> {
    const project = await Project.findOne({
      _id: projectId,
      organizationId
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    const tasks = await Task.find({
      projectId,
      organizationId
    })
      .sort({ createdAt: -1 });

    return tasks;
  }

  async getEmployeeTasks(employeeId: string, organizationId: string): Promise<ITask[]> {
    const tasks = await Task.find({
      organizationId,
      employeeId: employeeId
    })
      .sort({ createdAt: -1 });

    return tasks;
  }

  async validateTaskAccess(taskId: string, organizationId: string): Promise<boolean> {
    const task = await Task.findOne({
      _id: taskId,
      organizationId
    });

    return !!task;
  }
}

export default new TaskService();
