'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { format, subDays } from 'date-fns';

interface AppUsageStats {
  app: string;
  count: number;
  percentage: number;
  lastUsed: string;
}

interface Employee {
  _id: string;
  name: string;
  email: string;
}

export default function AppUsagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [appUsage, setAppUsage] = useState<AppUsageStats[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 7).getTime(),
    end: new Date().getTime()
  });

  const safeEmployees = Array.isArray(employees) ? employees : [];

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }

    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchAppUsage();
    }
  }, [selectedEmployee, dateRange]);

  const fetchEmployees = async () => {
    try {
      const response = await api.listEmployees();
      const employeeList = response.data?.data?.employees || [];

      setEmployees(employeeList);

      if (employeeList.length > 0) {
        setSelectedEmployee(employeeList[0]._id);
      } else {
        setSelectedEmployee('');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
      setSelectedEmployee('');
    }
  };

  const fetchAppUsage = async () => {
    if (!selectedEmployee) return;
    
    try {
      setLoading(true);
      const response = await api.getAppUsage({
        employeeId: selectedEmployee,
        start: dateRange.start,
        end: dateRange.end
      });
      setAppUsage(response.data.data || []);
    } catch (error) {
      console.error('Error fetching app usage:', error);
      setAppUsage([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (days: number) => {
    setDateRange({
      start: subDays(new Date(), days).getTime(),
      end: new Date().getTime()
    });
  };

  const totalScreenshots = appUsage.reduce((sum, app) => sum + app.count, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Application Usage</h1>
          <p className="text-gray-600 mt-2">
            Track which applications your team uses during work hours
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={safeEmployees.length === 0}
              >
                {safeEmployees.length === 0 ? (
                  <option value="">No employees found</option>
                ) : (
                  safeEmployees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDateRangeChange(1)}
                  className={`px-4 py-2 rounded-lg ${
                    dateRange.start === subDays(new Date(), 1).getTime()
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => handleDateRangeChange(7)}
                  className={`px-4 py-2 rounded-lg ${
                    dateRange.start === subDays(new Date(), 7).getTime()
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => handleDateRangeChange(30)}
                  className={`px-4 py-2 rounded-lg ${
                    dateRange.start === subDays(new Date(), 30).getTime()
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  30 Days
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Total Apps</div>
            <div className="text-3xl font-bold text-gray-900">{appUsage.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Total Screenshots</div>
            <div className="text-3xl font-bold text-gray-900">{totalScreenshots}</div>
          </div>
        </div>

        {safeEmployees.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 text-lg mb-2">No Employees Found</p>
            <p className="text-gray-500 text-sm">
              Add employees to your organization to track their application usage.
            </p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading app usage data...</p>
          </div>
        ) : (
          <>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  All Applications
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Application
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Count
                      </th> 
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usage (%)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Used
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appUsage.map((app, index) => (
                      <tr key={app.app} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                              {index + 1}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {app.app}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {app.count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2 max-w-[100px]">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${app.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900">
                              {app.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(app.lastUsed), 'MMM d, HH:mm')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {appUsage.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No application usage data found for the selected period.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
