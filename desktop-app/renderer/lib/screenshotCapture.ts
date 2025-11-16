import api from './api';
import { uploadScreenshotToS3 } from './storage';

export interface CaptureScreenshotParams {
  user: {
    id: string;
    organizationId: string;
    name: string;
    email?: string;
  };
  activeShift?: {
    _id: string;
  };
  selectedProject?: string;
  selectedTask?: string;
  getProjectName?: (projectId: string) => string;
}

export async function captureAndUploadScreenshot(params: CaptureScreenshotParams): Promise<void> {
  const { user, activeShift, selectedProject, selectedTask, getProjectName } = params;

  if (typeof window === 'undefined' || !window.electron) {
    throw new Error('Electron API not available');
  }

  const activeWindow = await window.electron.getActiveWindow();
  const screenshotBase64 = await window.electron.captureScreen();
  
  if (!screenshotBase64) {
    throw new Error('Failed to capture screenshot');
  }

  const base64Data = screenshotBase64.replace(/^data:image\/\w+;base64,/, '');
  const imageBuffer = Buffer.from(base64Data, 'base64');

  const s3Url = await uploadScreenshotToS3(imageBuffer, {
    organizationId: user.organizationId,
    employeeId: user.id,
    timestamp: Date.now(),
    shiftId: activeShift?._id,
  });

  const computerName = typeof window !== 'undefined' 
    ? (window.navigator?.userAgent?.match(/\(([^)]+)\)/)?.[1] || `${user.name}'s Computer`)
    : `${user.name}'s Computer`;
  
  const hwid = `desktop-${user.organizationId}-${user.id}`.substring(0, 32);
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  
  let osName = 'unknown';
  if (userAgent.includes('Mac')) osName = 'darwin';
  else if (userAgent.includes('Win')) osName = 'win32';
  else if (userAgent.includes('Linux')) osName = 'linux';

  const projectName = selectedProject && getProjectName 
    ? getProjectName(selectedProject) 
    : 'Time Tracking';

  const screenshotPayload = {
    timestamp: Date.now(),
    timezoneOffset: new Date().getTimezoneOffset() * 60000,
    app: activeWindow?.app || 'Desktop Time Tracker',
    appFileName: activeWindow?.appFileName || 'tracker',
    appFilePath: activeWindow?.appFilePath || '/app/tracker',
    title: activeWindow?.title || projectName,
    user: user.email || user.name,
    computer: computerName,
    name: user.name,
    hwid: hwid,
    os: osName,
    osVersion: userAgent,
    employeeId: user.id,
    shiftId: activeShift?._id,
    projectId: selectedProject,
    taskId: selectedTask || undefined,
    filePath: s3Url,
    permission: true,
  };

  await api.createScreenshot(screenshotPayload);
}
