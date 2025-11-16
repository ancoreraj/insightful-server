"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, Download, Apple, MonitorPlay, Info, LogOut, User } from "lucide-react";

export default function DownloadPage() {
  const router = useRouter();
  const [platform, setPlatform] = useState<string>("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf("mac") !== -1) {
      setPlatform("mac");
    } else if (userAgent.indexOf("win") !== -1) {
      setPlatform("windows");
    } else if (userAgent.indexOf("linux") !== -1) {
      setPlatform("linux");
    } else {
      setPlatform("mac");
    }

    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const downloadLinks = {
    mac: process.env.NEXT_PUBLIC_APP_DOWNLOAD_URL_MAC || "#",
    windows: process.env.NEXT_PUBLIC_APP_DOWNLOAD_URL_WINDOWS || "#",
    linux: process.env.NEXT_PUBLIC_APP_DOWNLOAD_URL_LINUX || "#",
  };

  const handleDownload = (os: string) => {
    const link = downloadLinks[os as keyof typeof downloadLinks];
    if (link !== "#") {
      window.location.href = link;
    } else {
      alert("Download link not available. Please contact your administrator.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Clock className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Insightful</span>
          </Link>
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Sign in
            </Link>
          )}
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            {user && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 font-medium">
                  Welcome, {user.name}! 👋
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  Download the desktop app to start tracking your time
                </p>
              </div>
            )}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Download Insightful App
            </h1>
            <p className="text-lg text-gray-600">
              Track your time seamlessly with our desktop application
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div
              className={`bg-white rounded-lg shadow-lg p-6 border-2 ${
                platform === "mac"
                  ? "border-blue-600"
                  : "border-gray-100"
              }`}
            >
              <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mb-4 mx-auto">
                <Apple className="h-8 w-8 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                macOS
              </h3>
              <p className="text-sm text-gray-600 text-center mb-4">
                macOS 10.15 or later
              </p>
              {platform === "mac" && (
                <div className="flex items-center justify-center mb-3">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    Recommended for you
                  </span>
                </div>
              )}
              <button
                onClick={() => handleDownload("mac")}
                className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
            </div>

            <div
              className={`bg-white rounded-lg shadow-lg p-6 border-2 ${
                platform === "windows"
                  ? "border-blue-600"
                  : "border-gray-100"
              }`}
            >
              <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mb-4 mx-auto">
                <MonitorPlay className="h-8 w-8 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                Windows
              </h3>
              <p className="text-sm text-gray-600 text-center mb-4">
                Windows 10 or later
              </p>
              {platform === "windows" && (
                <div className="flex items-center justify-center mb-3">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    Recommended for you
                  </span>
                </div>
              )}
              <button
                onClick={() => handleDownload("windows")}
                className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
            <div className="flex items-start">
              <Info className="h-6 w-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Installation Instructions
                </h3>
                <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                  <li>Download the installer for your operating system</li>
                  <li>Open the downloaded file and follow the installation prompts</li>
                  <li>Launch the Insightful app from your applications</li>
                  <li>Sign in with your email and password</li>
                  <li>Start tracking your time!</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Need help? Contact your system administrator or{" "}
              <a href="mailto:support@insightful.com" className="text-blue-600 hover:text-blue-700 font-medium">
                support@insightful.com
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
