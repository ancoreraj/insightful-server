const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron');
const path = require('path');
const Store = require('electron-store');
const activeWin = require('active-win');

const store = new Store();

let mainWindow;
let activeShift = null;
let timerInterval = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#ffffff',
    title: 'Insightful Time Tracker'
  });

  // In development, load from Next.js dev server
  // Check if running from node_modules (development) or packaged (production)
  const isDev = !app.isPackaged;
  const url = isDev
    ? 'http://localhost:3002'
    : `file://${path.join(__dirname, '../renderer/out/index.html')}`;

  mainWindow.loadURL(url);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const token = store.get('authToken');
  if (token) {
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.send('auth-token', token);
    });
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('save-auth-token', async (event, token) => {
  if (!token || token === null || token === undefined || token === '') {
    store.delete('authToken');
  } else {
    store.set('authToken', token);
  }
  return { success: true };
});

ipcMain.handle('get-auth-token', async () => {
  return store.get('authToken', null);
});

ipcMain.handle('save-user', async (event, user) => {
  if (user) {
    store.set('user', user);
  } else {
    store.delete('user');
  }
  return { success: true };
});

ipcMain.handle('get-stored-user', async () => {
  return store.get('user', null);
});

ipcMain.handle('save-refresh-token', async (event, token) => {
  if (!token || token === null || token === undefined || token === '') {
    store.delete('refreshToken');
  } else {
    store.set('refreshToken', token);
  }
  return { success: true };
});

ipcMain.handle('get-refresh-token', async () => {
  return store.get('refreshToken', null);
});

ipcMain.handle('clear-auth-token', async () => {
  store.delete('authToken');
  store.delete('refreshToken');
  store.delete('user');
  return { success: true };
});

ipcMain.handle('start-shift', async (event, shiftData) => {
  activeShift = {
    ...shiftData,
    startTime: Date.now(),
    elapsed: 0
  };
  store.set('activeShift', activeShift);
  
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (activeShift) {
      activeShift.elapsed = Date.now() - activeShift.startTime;
      mainWindow.webContents.send('timer-update', activeShift.elapsed);
    }
  }, 1000);
  
  return { success: true, shift: activeShift };
});

ipcMain.handle('stop-shift', async () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  const shift = activeShift;
  activeShift = null;
  store.delete('activeShift');
  
  return { success: true, shift };
});

ipcMain.handle('get-active-shift', async () => {
  const storedShift = store.get('activeShift', null);
  if (storedShift) {
    activeShift = storedShift;
    activeShift.elapsed = Date.now() - activeShift.startTime;
    
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (activeShift) {
        activeShift.elapsed = Date.now() - activeShift.startTime;
        mainWindow.webContents.send('timer-update', activeShift.elapsed);
      }
    }, 1000);
  }
  return activeShift;
});

ipcMain.handle('get-app-info', async () => {
  return {
    version: app.getVersion(),
    platform: process.platform,
    name: app.getName()
  };
});

ipcMain.handle('capture-screen', async () => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 }
    });

    if (sources.length === 0) {
      return null;
    }

    const source = sources[0];
    const dataUrl = source.thumbnail.toDataURL();
    
    return dataUrl;
  } catch (error) {
    return null;
  }
});

ipcMain.handle('get-active-window', async () => {
  try {
    const window = await activeWin();
    if (window) {
      return {
        app: window.owner.name,
        title: window.title,
        appFileName: window.owner.path || window.owner.name,
        appFilePath: window.owner.path || window.owner.name
      };
    }
    return null;
  } catch (error) {
    return null;
  }
});
