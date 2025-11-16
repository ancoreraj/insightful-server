export interface ElectronAPI {
  saveAuthToken: (token: string) => Promise<{ success: boolean }>;
  getAuthToken: () => Promise<string | null>;
  saveRefreshToken: (token: string) => Promise<{ success: boolean }>;
  getRefreshToken: () => Promise<string | null>;
  saveUser: (user: any) => Promise<{ success: boolean }>;
  getStoredUser: () => Promise<any>;
  clearAuthToken: () => Promise<{ success: boolean }>;
  startShift: (shiftData: any) => Promise<{ success: boolean }>;
  stopShift: () => Promise<{ success: boolean; shift?: any }>;
  getActiveShift: () => Promise<any>;
  onTimerUpdate: (callback: (elapsed: number) => void) => void;
  getAppInfo: () => Promise<{ version: string; platform: string; name: string }>;
  captureScreen: () => Promise<string | null>;
  getActiveWindow: () => Promise<{
    app: string;
    title: string;
    appFileName: string;
    appFilePath: string;
  } | null>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {};
