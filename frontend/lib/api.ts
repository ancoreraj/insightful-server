import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        // On 401, clear tokens and redirect to login
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            console.log('401 Unauthorized - Session expired, redirecting to login...');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.client.post('/auth/login', { email, password });
  }

  async refreshToken(refreshToken: string) {
    return this.client.post('/auth/refresh', { refreshToken });
  }

  async logout(refreshToken: string) {
    return this.client.post('/auth/logout', { refreshToken });
  }

  async setupAccount(token: string, password: string, passwordConfirm: string) {
    return this.client.post('/auth/setup-account', {
      token,
      password,
      passwordConfirm,
    });
  }

  // Employee endpoints
  async listEmployees() {
    return this.client.get('/employee');
  }

  async getEmployee(id: string) {
    return this.client.get(`/employee/${id}`);
  }

  async getCurrentEmployee() {
    return this.client.get('/employee/me');
  }

  async createEmployee(data: {
    email: string;
    name: string;
    teamId?: string;
    type?: string;
    projects?: string[];
  }) {
    return this.client.post('/employee', data);
  }

  async updateEmployee(id: string, data: any) {
    return this.client.put(`/employee/${id}`, data);
  }

  async deactivateEmployee(id: string) {
    return this.client.delete(`/employee/${id}`);
  }

  async reactivateEmployee(id: string) {
    return this.client.put(`/employee/${id}/reactivate`);
  }

  // Project endpoints
  async listProjects(params?: { archived?: boolean }) {
    return this.client.get('/project', { params });
  }

  async getProject(id: string) {
    return this.client.get(`/project/${id}`);
  }

  async createProject(data: {
    name: string;
    description?: string;
    billable?: boolean;
    employees?: string[];
    teams?: string[];
  }) {
    return this.client.post('/project', data);
  }

  async updateProject(id: string, data: any) {
    return this.client.put(`/project/${id}`, data);
  }

  async deleteProject(id: string) {
    return this.client.delete(`/project/${id}`);
  }

  async archiveProject(id: string) {
    return this.client.put(`/project/${id}/archive`);
  }

  async unarchiveProject(id: string) {
    return this.client.put(`/project/${id}/unarchive`);
  }

  async assignEmployeesToProject(id: string, employeeIds: string[]) {
    return this.client.put(`/project/${id}/employees`, { employeeIds });
  }

  async assignTeamsToProject(id: string, teamIds: string[]) {
    return this.client.put(`/project/${id}/teams`, { teamIds });
  }

  // Task endpoints
  async listTasks(params?: { projectId?: string; employeeId?: string }) {
    return this.client.get('/task', { params });
  }

  async getTask(id: string) {
    return this.client.get(`/task/${id}`);
  }

  async createTask(data: {
    name: string;
    description?: string;
    projectId: string;
    priority?: string;
    status?: string;
    employeeId?: string;
    teams?: string[];
  }) {
    return this.client.post('/task', data);
  }

  async updateTask(id: string, data: any) {
    return this.client.put(`/task/${id}`, data);
  }

  async deleteTask(id: string) {
    return this.client.delete(`/task/${id}`);
  }

  async assignEmployeeToTask(id: string, employeeId: string) {
    return this.client.put(`/task/${id}/employee`, { employeeId });
  }

  async unassignEmployeeFromTask(id: string) {
    return this.client.delete(`/task/${id}/employee`);
  }

  async assignTeamsToTask(id: string, teamIds: string[]) {
    return this.client.put(`/task/${id}/teams`, { teamIds });
  }

  // Project Time (Analytics)
  async getProjectTime(params: {
    start: number;
    end: number;
    projectId?: string;
    taskId?: string;
    employeeId?: string;
  }) {
    return this.client.get('/analytics/project-time', { params });
  }

  // Shift endpoints
  async createShift(data: {
    type: string;
    start: number;
    employeeId: string;
    timezoneOffset?: number;
    user?: string;
    computer?: string;
    name?: string;
    hwid?: string;
    os?: string;
  }) {
    return this.client.post('/analytics/shift', data);
  }

  async endShift(employeeId: string, endTime: number) {
    return this.client.post('/analytics/shift/end', { employeeId, endTime });
  }

  async findShifts(params: {
    start: number;
    end: number;
    employeeId?: string;
    limit?: number;
  }) {
    return this.client.get('/analytics/shift', { params });
  }

  async getShift(id: string) {
    return this.client.get(`/analytics/shift/${id}`);
  }

  async updateShift(id: string, data: any) {
    return this.client.put(`/analytics/shift/${id}`, data);
  }

  async deleteShift(id: string) {
    return this.client.delete(`/analytics/shift/${id}`);
  }

  // Screenshot endpoints
  async listScreenshots(params: {
    start: number;
    end: number;
    employeeId?: string;
    projectId?: string;
    taskId?: string;
    shiftId?: string;
    limit?: number;
  }) {
    return this.client.get('/analytics/screenshot', { params });
  }

  async getScreenshot(id: string) {
    return this.client.get(`/analytics/screenshot/${id}`);
  }

  async deleteScreenshot(id: string) {
    return this.client.delete(`/analytics/screenshot/${id}`);
  }

  async getScreenshotStats(params: { start: number; end: number }) {
    return this.client.get('/analytics/screenshot/stats', { params });
  }

  async getScreenshotsWithPermissionIssues(params: {
    start: number;
    end: number;
  }) {
    return this.client.get('/analytics/screenshot/permission-issues', { params });
  }

  // App Usage endpoints
  async getAppUsage(params: {
    employeeId?: string;
    projectId?: string;
    taskId?: string;
    start: number;
    end: number;
  }) {
    return this.client.get('/app-usage', { params });
  }

  async getTopApps(params: {
    employeeId?: string;
    projectId?: string;
    start: number;
    end: number;
    limit?: number;
  }) {
    return this.client.get('/app-usage/top', { params });
  }

  async getAppTimeline(params: {
    app: string;
    employeeId: string;
    start: number;
    end: number;
  }) {
    return this.client.get('/app-usage/timeline', { params });
  }

  async getProductivityInsights(
    employeeId: string,
    start: number,
    end: number
  ) {
    return this.client.get('/app-usage/productivity', {
      params: { employeeId, start, end }
    });
  }
}

export const api = new ApiClient();
export default api;
