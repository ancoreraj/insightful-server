import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;
  private onUnauthorized: (() => void) | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (originalRequest.url?.includes('/auth/refresh')) {
          return Promise.reject(error);
        }
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            if (typeof window !== 'undefined' && window.electron) {
              const refreshToken = await window.electron.getRefreshToken();
              
              if (!refreshToken) {
                throw new Error('No refresh token available');
              }
              
              const response = await this.refreshAccessToken(refreshToken);
              const { accessToken, refreshToken: newRefreshToken } = response.data.data;        
              
              this.token = accessToken;
              await window.electron.saveAuthToken(accessToken);
              
              if (newRefreshToken) {
                await window.electron.saveRefreshToken(newRefreshToken);
              }
              
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            
            this.token = null;
            if (typeof window !== 'undefined' && window.electron) {
              await window.electron.clearAuthToken();
            }
            
            if (this.onUnauthorized) {
              this.onUnauthorized();
            }
            
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  setUnauthorizedCallback(callback: () => void) {
    this.onUnauthorized = callback;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    return response;
  }

  async refreshAccessToken(refreshToken: string) {
    const response = await this.client.post('/auth/refresh', { refreshToken });
    return response;
  }

  async listProjects() {
    const response = await this.client.get('/project');
    return response;
  }

  async getProject(id: string) {
    const response = await this.client.get(`/project/${id}`);
    return response;
  }

  async listTasks(filters?: { projectId?: string; employeeId?: string }) {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.employeeId) params.append('employeeId', filters.employeeId);
    
    const response = await this.client.get(`/task?${params.toString()}`);
    return response;
  }

  async createShift(data: {
    type: 'auto' | 'manual';
    start: number;
    end?: number;
    employeeId: string;
  }) {
    const response = await this.client.post('/analytics/shift', data);
    return response;
  }

  async updateShift(id: string, data: { end?: number }) {
    const response = await this.client.put(`/analytics/shift/${id}`, data);
    return response;
  }

  async listShifts(filters: {
    start: number;
    end: number;
    employeeId?: string;
  }) {
    const params = new URLSearchParams();
    params.append('start', filters.start.toString());
    params.append('end', filters.end.toString());
    if (filters.employeeId) params.append('employeeId', filters.employeeId);
    
    const response = await this.client.get(`/analytics/shifts?${params.toString()}`);
    return response;
  }

async createScreenshot(data: {
    timestamp: number;
    timezoneOffset?: number;
    app: string;
    appFileName?: string;
    appFilePath?: string;
    title?: string;
    url?: string;
    user: string;
    computer: string;
    name: string;
    hwid: string;
    os: string;
    osVersion?: string;
    employeeId: string;
    shiftId?: string;
    projectId?: string;
    taskId?: string;
    filePath: string;
    permission: boolean;
  }) {
    const response = await this.client.post('/analytics/screenshot', data);
    return response;
  }
}

const api = new ApiClient();
export default api;
