const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  saveAuthToken: (token) => ipcRenderer.invoke('save-auth-token', token),
  getAuthToken: () => ipcRenderer.invoke('get-auth-token'),
  saveRefreshToken: (token) => ipcRenderer.invoke('save-refresh-token', token),
  getRefreshToken: () => ipcRenderer.invoke('get-refresh-token'),
  saveUser: (user) => ipcRenderer.invoke('save-user', user),
  getStoredUser: () => ipcRenderer.invoke('get-stored-user'),
  clearAuthToken: () => ipcRenderer.invoke('clear-auth-token'),
  startShift: (shiftData) => ipcRenderer.invoke('start-shift', shiftData),
  stopShift: () => ipcRenderer.invoke('stop-shift'),
  getActiveShift: () => ipcRenderer.invoke('get-active-shift'),
  onTimerUpdate: (callback) => {
    ipcRenderer.on('timer-update', (event, elapsed) => callback(elapsed));
  },
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  captureScreen: () => ipcRenderer.invoke('capture-screen'),
  getActiveWindow: () => ipcRenderer.invoke('get-active-window'),
});
