"use client";

import { useEffect, useState } from "react";
import { Users, Clock, Camera, TrendingUp } from "lucide-react";
import api from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeShifts: 0,
    screenshotsToday: 0,
    totalHoursToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const employeesRes = await api.listEmployees();
      const employees = employeesRes.data.data.employees || [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const shiftsRes = await api.findShifts({
        start: today.getTime(),
        end: tomorrow.getTime(),
        limit: 10000,
      });
      const shifts = shiftsRes.data;

      const activeShifts = shifts.filter((s: any) => !s.end).length;

      const totalMinutes = shifts.reduce((acc: number, shift: any) => {
        if (shift.end) {
          const duration = (new Date(shift.end).getTime() - new Date(shift.start).getTime()) / 1000 / 60;
          return acc + duration;
        }
        return acc;
      }, 0);

      setStats({
        totalEmployees: employees.length,
        activeShifts,
        screenshotsToday: 0,
        totalHoursToday: Math.round(totalMinutes / 60 * 10) / 10,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: "Total Employees",
      value: stats.totalEmployees,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      name: "Active Shifts",
      value: stats.activeShifts,
      icon: Clock,
      color: "bg-green-500",
    },
    {
      name: "Screenshots Today",
      value: stats.screenshotsToday,
      icon: Camera,
      color: "bg-purple-500",
    },
    {
      name: "Hours Today",
      value: stats.totalHoursToday.toFixed(1),
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-lg shadow p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/dashboard/employees"
            className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow"
          >
            <Users className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900">Manage Employees</h3>
            <p className="text-sm text-gray-600 mt-1">
              Invite, view, and manage your team members
            </p>
          </a>

          <a
            href="/dashboard/time-tracking"
            className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow"
          >
            <Clock className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900">Time Tracking</h3>
            <p className="text-sm text-gray-600 mt-1">
              View live shifts and shift history
            </p>
          </a>

          <a
            href="/dashboard/screenshots"
            className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow"
          >
            <Camera className="h-8 w-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900">Screenshots</h3>
            <p className="text-sm text-gray-600 mt-1">
              Monitor screenshots and activity
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
