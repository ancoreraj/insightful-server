"use client";

import { useEffect, useState } from "react";
import { Clock, Calendar, Loader2, PlayCircle, StopCircle, RefreshCw } from "lucide-react";
import api from "@/lib/api";

export default function TimeTrackingPage() {
  const [activeTab, setActiveTab] = useState<"live" | "history">("live");
  const [liveShifts, setLiveShifts] = useState<any[]>([]);
  const [shiftHistory, setShiftHistory] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingLive, setRefreshingLive] = useState(false);
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);
    
    return {
      start: sevenDaysAgo,
      end: endOfToday,
    };
  });
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === "history") {
      loadShiftHistory();
    }
  }, [activeTab, dateRange, selectedEmployee]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [employeesRes] = await Promise.all([
        api.listEmployees(),
      ]);
      setEmployees(employeesRes.data.data.employees || []);
      await loadLiveShifts();
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadLiveShifts = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await api.findShifts({
        start: today.getTime(),
        end: tomorrow.getTime(),
        limit: 10000,
      });

      const shifts = Array.isArray(response.data) ? response.data : [];
      const active = shifts.filter((shift: any) => !shift.end);
      setLiveShifts(active);
    } catch (error) {
      console.error("Error loading live shifts:", error);
    }
  };

  const handleRefreshLiveShifts = async () => {
    setRefreshingLive(true);
    await loadLiveShifts();
    setRefreshingLive(false);
  };

  const loadShiftHistory = async () => {
    try {
      const params: any = {
        start: dateRange.start.getTime(),
        end: dateRange.end.getTime(),
        limit: 10000,
      };

      if (selectedEmployee) {
        params.employeeId = selectedEmployee;
      }

      const response = await api.findShifts(params);
      const shifts = Array.isArray(response.data) ? response.data : [];
      setShiftHistory(shifts);
    } catch (error) {
      console.error("Error loading shift history:", error);
    }
  };

  const formatDuration = (start: string, end?: string) => {
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : Date.now();
    const durationMs = endTime - startTime;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const getEmployeeName = (employeeId: any) => {
    if (typeof employeeId === 'object' && employeeId?.name) {
      return employeeId.name;
    }
    
    const idString = typeof employeeId === 'object' ? employeeId?._id : employeeId;
    const employee = employees.find((e) => e._id === idString);
    return employee?.name || "Unknown";
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
        <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
        <p className="text-gray-600">Monitor shifts and work hours</p>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("live")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "live"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center">
              <PlayCircle className="h-5 w-5 mr-2" />
              Live Shifts ({liveShifts.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "history"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              History
            </div>
          </button>
        </nav>
      </div>

        {activeTab === "live" && (
        <div>
          <div className="mb-4 flex justify-end">
            <button
              onClick={handleRefreshLiveShifts}
              disabled={refreshingLive}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshingLive ? 'animate-spin' : ''}`} />
              {refreshingLive ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {liveShifts.length === 0 ? (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
              <StopCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No active shifts
              </h3>
              <p className="text-gray-600">
                No employees are currently clocked in
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveShifts.map((shift) => (
                <div
                  key={shift._id}
                  className="bg-white rounded-lg shadow border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                        {getEmployeeName(shift.employeeId).charAt(0)}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">
                          {getEmployeeName(shift.employeeId)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {shift.type}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                      <span className="text-xs text-green-600 font-medium">Live</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      Started: {new Date(shift.start).toLocaleTimeString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Duration: {formatDuration(shift.start)}
                    </div>
                  </div>

                  {shift.computer && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-xs text-gray-500">Computer: {shift.computer}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div>
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

          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shiftHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No shifts found for the selected period
                      </td>
                    </tr>
                  ) : (
                    shiftHistory.map((shift) => (
                      <tr key={shift._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {shift.employeeId.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(shift.start).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {shift.end
                              ? new Date(shift.end).toLocaleString()
                              : "In Progress"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDuration(shift.start, shift.end)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {shift.paid ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Paid
                            </span>
                          ) : shift.end ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Unpaid
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              Active
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
