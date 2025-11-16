"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Users,
  ListTodo,
  Clock,
  Loader2,
  Trash2,
  CheckCircle,
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [projectTime, setProjectTime] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date(),
  });

  useEffect(() => {
    loadData();
  }, [projectId]);

  useEffect(() => {
    loadProjectTime();
  }, [dateRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectRes, tasksRes, employeesRes] = await Promise.all([
        api.getProject(projectId),
        api.listTasks({ projectId }),
        api.listEmployees(),
      ]);
      setProject(projectRes.data.data);
      setTasks(tasksRes.data.data.tasks || []);
      setEmployees(employeesRes.data.data.employees || []);
      await loadProjectTime();
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Failed to load project details");
      router.push("/dashboard/projects");
    } finally {
      setLoading(false);
    }
  };

  const loadProjectTime = async () => {
    try {
      const response = await api.getProjectTime({
        start: dateRange.start.getTime(),
        end: dateRange.end.getTime(),
        projectId,
      });
      
      const entries = response.data;
      const totalMinutes = entries.reduce((acc: number, entry: any) => {
        return acc + (entry.time || 0);
      }, 0);

      setProjectTime({
        totalHours: Math.round(totalMinutes / 60 * 10) / 10,
        entries: entries.length,
      });
    } catch (error) {
      console.error("Error loading project time:", error);
    }
  };

  const getEmployeeName = (employeeId: string | undefined) => {
    if (!employeeId) return null;
    const employee = employees.find((e) => e._id === employeeId);
    return employee?.name || 'Unknown Employee';
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await api.deleteTask(taskId);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete task");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/projects"
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            {project.description && (
              <p className="text-gray-600 mt-1">{project.description}</p>
            )}
          </div>
          <button
            onClick={() => setShowTaskModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
            </div>
            <ListTodo className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {tasks.filter((t) => t.status === "completed").length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Assigned Employees</p>
              <p className="text-2xl font-bold text-gray-900">
                {project.employees?.length || 0}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Time Logged (30d)</p>
              <p className="text-2xl font-bold text-gray-900">
                {projectTime?.totalHours || 0}h
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="font-medium text-gray-900">
              {project.archived ? "Archived" : "Active"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Billing Type</p>
            <p className="font-medium text-gray-900">
              {project.billable ? "Billable" : "Non-Billable"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Created</p>
            <p className="font-medium text-gray-900">
              {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Last Updated</p>
            <p className="font-medium text-gray-900">
              {new Date(project.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Assigned Employees</h3>
          <span className="text-sm text-gray-500">
            {project.employees?.length || 0} employee{project.employees?.length !== 1 ? 's' : ''}
          </span>
        </div>
        {project.employees && project.employees.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.employees.map((employeeId: string) => {
              const employee = employees.find((e) => e._id === employeeId);
              return employee ? (
                <div
                  key={employeeId}
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {employee.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {employee.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{employee.email}</p>
                  </div>
                  <div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        employee.deactivated
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {employee.deactivated ? "Inactive" : "Active"}
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  key={employeeId}
                  className="p-3 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <p className="text-sm text-gray-500">Employee not found</p>
                  <p className="text-xs text-gray-400">ID: {employeeId}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No employees assigned to this project</p>
            <p className="text-sm text-gray-500 mt-1">
              Edit the project to assign employees
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center">
            <ListTodo className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-600 mb-4">Create your first task to get started</p>
            <button
              onClick={() => setShowTaskModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <div key={task._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-base font-medium text-gray-900">{task.name}</h4>
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
                        {task.priority} priority
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {task.employeeId ? (
                          <span className="text-gray-700 font-medium">{getEmployeeName(task.employeeId)}</span>
                        ) : (
                          <span className="text-gray-400">Unassigned</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDeleteTask(task._id)}
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

      {showTaskModal && (
        <AddTaskModal
          projectId={projectId}
          project={project}
          employees={employees}
          onClose={() => setShowTaskModal(false)}
          onSuccess={() => {
            setShowTaskModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function AddTaskModal({
  projectId,
  project,
  employees,
  onClose,
  onSuccess,
}: {
  projectId: string;
  project: any;
  employees: any[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priority: "medium",
    status: "todo",
    employeeId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const taskData: any = { 
        name: formData.name,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        projectId 
      };
      
      if (formData.employeeId) {
        taskData.employeeId = formData.employeeId;
      }
      
      await api.createTask(taskData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 my-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Task</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign Employee (optional)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Only employees assigned to this project can be added to this task
            </p>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No employee assigned</option>
              {employees
                .filter((employee) => project.employees?.includes(employee._id))
                .map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name} ({employee.email})
                  </option>
                ))}
            </select>
            {employees.filter((e) => project.employees?.includes(e._id)).length === 0 && (
              <p className="text-xs text-gray-500 mt-2">
                No employees assigned to this project yet. Please assign employees to the project first.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
