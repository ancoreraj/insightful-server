'use client';

import { useEffect, useState } from 'react';
import { Play, Square, Clock, LogOut, FolderOpen, ListTodo, User, RefreshCw, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { captureAndUploadScreenshot } from '@/lib/screenshotCapture';

interface TimeTrackerProps {
  user: any;
  onLogout: () => void;
}

export default function TimeTracker({ user, onLogout }: TimeTrackerProps) {
  const SCREENSHOT_INTERVAL_MS = (parseInt(process.env.NEXT_PUBLIC_SCREENSHOT_INTERVAL_SECONDS || '300') * 1000);
  
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activeShift, setActiveShift] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    checkActiveShift();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadProjectTasks(selectedProject);
    } else {
      setTasks([]);
      setSelectedTask('');
    }
  }, [selectedProject]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electron) {
      window.electron.onTimerUpdate((elapsed: number) => {
        setElapsedTime(elapsed);
      });
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const projectsRes = await api.listProjects();
      const allProjects = projectsRes.data.data.projects || [];
      
      const myProjects = allProjects.filter((p: any) => 
        p.employees && p.employees.includes(user.id)
      );
      
      setProjects(myProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectTasks = async (projectId: string) => {
    try {
      const tasksRes = await api.listTasks({ projectId, employeeId: user.id });
      const allTasks = tasksRes.data.data.tasks || [];
      
      const myTasks = allTasks.filter((t: any) => 
        !t.employeeId || t.employeeId === user.id
      );
      
      setTasks(myTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const checkActiveShift = async () => {
    try {
      if (typeof window !== 'undefined' && window.electron) {
        const shift = await window.electron.getActiveShift();
        if (shift) {
          setActiveShift(shift);
          setIsTracking(true);
          setElapsedTime(shift.elapsed || 0);
          setSelectedProject(shift.projectId || '');
          setSelectedTask(shift.taskId || '');
        }
      }
    } catch (error) {
      console.error('Error checking active shift:', error);
    }
  };

  const handleStartTracking = async () => {
    if (!selectedProject) {
      alert('Please select a project first');
      return;
    }

    try {
      const shiftData = {
        type: 'manual' as const,
        start: Date.now(),
        employeeId: user.id,
        projectId: selectedProject,
        taskId: selectedTask || undefined,
      };

      const response = await api.createShift(shiftData);
      const createdShift = response.data.data;
      if (typeof window !== 'undefined' && window.electron) {
        await window.electron.startShift({
          ...shiftData,
          shiftId: createdShift._id,
        });
      }

      setActiveShift(createdShift);
      setIsTracking(true);
      setElapsedTime(0);
    } catch (error: any) {
      console.error('Error starting shift:', error);
      alert('Failed to start tracking: ' + (error.response?.data?.error?.message || error.message));
    }
  };

  const handleStopTracking = async () => {
    try {
      let shift;
      if (typeof window !== 'undefined' && window.electron) {
        const result = await window.electron.stopShift();
        shift = result.shift;
      }

      if (activeShift) {
        await api.updateShift(activeShift.shiftId || activeShift._id, {
          end: Date.now(),
        });
      }

      setActiveShift(null);
      setIsTracking(false);
      setElapsedTime(0);
      setSelectedProject('');
      setSelectedTask('');
    } catch (error: any) {
      console.error('Error stopping shift:', error);
      alert('Failed to stop tracking: ' + (error.response?.data?.error?.message || error.message));
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p._id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  const captureScreenshot = async () => {
    try {
      await captureAndUploadScreenshot({
        user: {
          id: user.id,
          organizationId: user.organizationId,
          name: user.name,
          email: user.email,
        },
        activeShift,
        selectedProject,
        selectedTask,
        getProjectName,
      });
    } catch (error: any) {
      console.error('Error capturing screenshot:', error);
      if (error.response?.data) {
        console.error('Backend error details:', error.response.data);
      }
    }
  };

  useEffect(() => {
    let screenshotInterval: NodeJS.Timeout;

    if (isTracking) {
      screenshotInterval = setInterval(() => {
        captureScreenshot();
      }, SCREENSHOT_INTERVAL_MS);

      captureScreenshot();
    }

    return () => {
      if (screenshotInterval) {
        clearInterval(screenshotInterval);
      }
    };
  }, [isTracking, selectedProject, selectedTask, activeShift]);

  const getTaskName = (taskId: string) => {
    const task = tasks.find(t => t._id === taskId);
    return task ? task.name : 'Unknown Task';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div className="absolute inset-0 animate-spin rounded-2xl border-4 border-transparent border-t-blue-600 border-r-purple-600"></div>
          </div>
          <p className="mt-6 text-gray-700 font-medium">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Insightful Time Tracker</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-gray-700">{user.name}</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all border border-red-200 hover:border-red-300"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Timer Display */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-10 relative overflow-hidden">
          {/* Animated gradient background for active tracking */}
          {isTracking && (
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-50"></div>
          )}
          <div className="text-center relative z-10">
            <div className={`text-7xl font-mono font-bold mb-6 transition-all duration-500 ${isTracking ? 'text-transparent bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text' : 'text-gray-400'}`}>
              {formatTime(elapsedTime)}
            </div>
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className={`w-4 h-4 rounded-full transition-all duration-300 ${isTracking ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' : 'bg-gray-300'}`}></div>
              <span className={`text-sm font-medium ${isTracking ? 'text-green-600' : 'text-gray-500'}`}>
                {isTracking ? 'Tracking active' : 'Not tracking'}
              </span>
            </div>

            {isTracking && activeShift && (
              <div className="mb-8 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl">
                <div className="text-sm space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-semibold text-gray-800">{getProjectName(activeShift.projectId)}</span>
                  </div>
                  {activeShift.taskId && (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <ListTodo className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="text-gray-700">{getTaskName(activeShift.taskId)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isTracking ? (
              <button
                onClick={handleStartTracking}
                disabled={!(selectedProject && selectedTask) || loading}
                className="inline-flex items-center space-x-3 px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 focus:ring-4 focus:ring-green-300 transition-all font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Play className="w-6 h-6" fill="currentColor" />
                <span>Start Tracking</span>
              </button>
            ) : (
              <button
                onClick={handleStopTracking}
                className="inline-flex items-center space-x-3 px-10 py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl hover:from-red-700 hover:to-rose-700 focus:ring-4 focus:ring-red-300 transition-all font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <Square className="w-6 h-6" fill="currentColor" />
                <span>Stop Tracking</span>
              </button>
            )}
          </div>
        </div>

        {/* Project and Task Selection */}
        {!isTracking && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Select Project & Task</h2>
              <button
                onClick={loadData}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-blue-200 hover:border-blue-300"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="font-medium">Refresh</span>
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FolderOpen className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-700 font-medium mb-1">No projects assigned yet</p>
                <p className="text-sm text-gray-500">Contact your administrator to get assigned to projects.</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                    <FolderOpen className="w-4 h-4 text-blue-600" />
                    <span>Project *</span>
                  </label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white font-medium"
                  >
                    <option value="">Select a project...</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProject && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                      <ListTodo className="w-4 h-4 text-indigo-600" />
                      <span>Task (Optional)</span>
                    </label>
                    {tasks.length === 0 ? (
                      <div className="text-sm text-gray-600 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-gray-400" />
                          <span>No tasks assigned to you in this project.</span>
                        </div>
                      </div>
                    ) : (
                      <select
                        value={selectedTask}
                        onChange={(e) => setSelectedTask(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white font-medium"
                      >
                        <option value="">No specific task</option>
                        {tasks.map((task) => (
                          <option key={task._id} value={task._id}>
                            {task.name} - {task.status}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
