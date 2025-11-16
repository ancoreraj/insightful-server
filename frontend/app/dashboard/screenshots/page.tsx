"use client";

import { useEffect, useState } from "react";
import { Camera, Calendar, Filter, AlertTriangle, TrendingUp, Loader2, Trash2 } from "lucide-react";
import api from "@/lib/api";

export default function ScreenshotsPage() {
  const [screenshots, setScreenshots] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setHours(0, 0, 0, 0)),
    end: new Date(new Date().setHours(23, 59, 59, 999)),
  });
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadScreenshots();
  }, [dateRange, selectedEmployee]);

  const loadData = async () => {
    try {
      setLoading(true);
      const employeesRes = await api.listEmployees();
      setEmployees(employeesRes.data.data.employees || []);
      await loadScreenshots();
      await loadStats();
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadScreenshots = async () => {
    try {
      const params: any = {
        start: dateRange.start.getTime(),
        end: dateRange.end.getTime(),
        limit: 100,
      };

      if (selectedEmployee) {
        params.employeeId = selectedEmployee;
      }

      const response = await api.listScreenshots(params);
      setScreenshots(response.data);
    } catch (error) {
      console.error("Error loading screenshots:", error);
      setScreenshots([]);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.getScreenshotStats({
        start: dateRange.start.getTime(),
        end: dateRange.end.getTime(),
      });
      setStats(response.data.data);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this screenshot?")) return;

    try {
      await api.deleteScreenshot(id);
      loadScreenshots();
      loadStats();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete screenshot");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Screenshots</h1>
        <p className="text-gray-600">Monitor employee activity and screenshots</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Screenshots</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Camera className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">With Permission</p>
                <p className="text-2xl font-bold text-green-600">{stats.withPermission}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Permission Denied</p>
                <p className="text-2xl font-bold text-red-600">{stats.withoutPermission}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Permission Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.permissionRate.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start.toISOString().split("T")[0]}
              onChange={(e) =>
                setDateRange({
                  ...dateRange,
                  start: new Date(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end.toISOString().split("T")[0]}
              onChange={(e) =>
                setDateRange({
                  ...dateRange,
                  end: new Date(e.target.value + "T23:59:59"),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {screenshots.length === 0 ? (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No screenshots found
          </h3>
          <p className="text-gray-600">
            No screenshots captured for the selected period
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {screenshots.map((screenshot) => (
            <div
              key={screenshot._id}
              className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden"
            >
              <div className={`h-40 relative overflow-hidden ${screenshot.blurred ? 'filter blur-sm' : ''}`}>
                {screenshot.permission && screenshot.filePath ? (
                  <img
                    src={screenshot.filePath}
                    alt={`Screenshot from ${screenshot.employeeId?.name || 'Unknown'}`}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(screenshot.filePath, '_blank')}
                    onLoad={() => console.log('Image loaded successfully:', screenshot.filePath)}
                    onError={(e) => {
                      // Fallback if image fails to load
                      console.error('Image failed to load:', screenshot.filePath);
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `
                        <div class="flex items-center justify-center h-full bg-gray-100">
                          <div class="text-center">
                            <svg class="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <p class="text-xs text-gray-500">Image not available</p>
                          </div>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <div className="text-center">
                      <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-2" />
                      <p className="text-xs text-red-500">Permission Denied</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-900">
                    {screenshot.employeeId.name}
                  </div>
                  <button
                    onClick={() => handleDelete(screenshot._id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-gray-600">
                    {new Date(screenshot.timestamp).toLocaleString()}
                  </div>
                  {screenshot.app && (
                    <div className="text-xs text-gray-600 truncate">
                      App: {screenshot.app}
                    </div>
                  )}
                  {screenshot.title && (
                    <div className="text-xs text-gray-600 truncate" title={screenshot.title}>
                      {screenshot.title}
                    </div>
                  )}
                </div>

                <div className="mt-2 flex items-center space-x-2">
                  {screenshot.permission ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                      Permitted
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800">
                      Denied
                    </span>
                  )}
                  {screenshot.blurred && (
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800">
                      Blurred
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
