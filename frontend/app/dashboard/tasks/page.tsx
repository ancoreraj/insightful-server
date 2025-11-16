"use client";

import { useEffect, useState } from "react";
import { Search, Filter, ListTodo, Loader2, Trash2, CheckCircle, Circle, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    projectId: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filters, tasks]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksRes, projectsRes, employeesRes] = await Promise.all([
        api.listTasks(),
        api.listProjects(),
        api.listEmployees(),
      ]);
      const tasksArray = tasksRes.data.data.tasks || [];
      const projectsArray = projectsRes.data.data.projects || [];
      setTasks(tasksArray);
      setFilteredTasks(tasksArray);
      setProjects(projectsArray);
      setEmployees(employeesRes.data.data.employees || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (filters.status) {
      filtered = filtered.filter((task) => task.status === filters.status);
    }
    if (filters.priority) {
      filtered = filtered.filter((task) => task.priority === filters.priority);
    }

    if (filters.projectId) {
      filtered = filtered.filter((task) => task.projectId === filters.projectId);
    }

    setFilteredTasks(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await api.deleteTask(id);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete task");
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await api.updateTask(id, { status: newStatus });
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update task");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "in-progress":
        return "text-blue-600 bg-blue-100";
      case "todo":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-orange-600 bg-orange-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p._id === projectId);
    return project?.name || "Unknown Project";
  };

  const getEmployeeName = (employeeId: string | undefined) => {
    if (!employeeId) return null;
    const employee = employees.find((e) => e._id === employeeId);
    return employee?.name || 'Unknown Employee';
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
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <p className="text-gray-600">Manage and track all tasks across projects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="text-sm text-gray-600">Total Tasks</div>
          <div className="text-2xl font-bold text-gray-900">{tasks.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="text-sm text-gray-600">To Do</div>
          <div className="text-2xl font-bold text-gray-600">
            {tasks.filter((t) => t.status === "todo").length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="text-sm text-gray-600">In Progress</div>
          <div className="text-2xl font-bold text-blue-600">
            {tasks.filter((t) => t.status === "in-progress").length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="text-sm text-gray-600">Completed</div>
          <div className="text-2xl font-bold text-green-600">
            {tasks.filter((t) => t.status === "completed").length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <select
            value={filters.projectId}
            onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Projects</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
          <ListTodo className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600">
            {searchQuery || filters.status || filters.priority || filters.projectId
              ? "Try adjusting your filters"
              : "Create tasks in your projects to get started"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task._id}
              className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-base font-medium text-gray-900">{task.name}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <Link
                        href={`/dashboard/projects/${task.projectId}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {getProjectName(task.projectId)}
                      </Link>
                      <span>•</span>
                      {task.employeeId ? (
                        <span className="text-gray-700 font-medium">{getEmployeeName(task.employeeId)}</span>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {task.status !== "completed" && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(
                          task._id,
                          task.status === "todo" ? "in-progress" : "completed"
                        )
                      }
                      className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      {task.status === "todo" ? "Start" : "Complete"}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(task._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
