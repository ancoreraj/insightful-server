"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, Users, Timer, Camera, LogOut, FolderKanban, ListTodo, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Employees",
    href: "/dashboard/employees",
    icon: Users,
  },
  {
    name: "Projects",
    href: "/dashboard/projects",
    icon: FolderKanban,
  },
  {
    name: "Tasks",
    href: "/dashboard/tasks",
    icon: ListTodo,
  },
  {
    name: "Time Tracking",
    href: "/dashboard/time-tracking",
    icon: Timer,
  },
  {
    name: "Screenshots",
    href: "/dashboard/screenshots",
    icon: Camera,
  },
  {
    name: "App Usage",
    href: "/dashboard/app-usage",
    icon: BarChart3,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-800">
        <Clock className="h-8 w-8 text-blue-400" />
        <span className="ml-3 text-xl font-bold">Insightful</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-800 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
