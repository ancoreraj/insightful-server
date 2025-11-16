'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import LoginPage from '@/components/LoginPage';
import TimeTracker from '@/components/TimeTracker';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    api.setUnauthorizedCallback(() => {
      handleLogout(true);
    });
  }, []);

  const checkAuth = async () => {
    try {
      console.log('🔍 Checking auth...');
      console.log('window.electron exists:', typeof window !== 'undefined' && !!window.electron);
      
      if (typeof window !== 'undefined' && window.electron) {
        console.log('📱 Getting stored token...');
        const token = await window.electron.getAuthToken();
        const storedUser = await window.electron.getStoredUser();
        
        console.log('Token exists:', !!token);
        console.log('User exists:', !!storedUser);
        
        if (token && storedUser) {
          api.setToken(token);
          setUser(storedUser);
          setIsAuthenticated(true);
          console.log('✅ Auth restored');
        } else {
          console.log('ℹ️ No stored auth, showing login');
        }
      } else {
        console.log('⚠️ window.electron not available');
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      if (typeof window !== 'undefined' && window.electron) {
        await window.electron.clearAuthToken();
      }
    } finally {
      console.log('✅ Setting loading to false');
      setLoading(false);
    }
  };

  const handleLogin = async (accessToken: string, refreshToken: string, userData: any) => {
    api.setToken(accessToken);
    if (typeof window !== 'undefined' && window.electron) {
      await window.electron.saveAuthToken(accessToken);
      await window.electron.saveRefreshToken(refreshToken);
      await window.electron.saveUser(userData);
    }
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = async (showMessage = false) => {
    if (typeof window !== 'undefined' && window.electron) {
      await window.electron.clearAuthToken();
    }
    api.setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    
    if (showMessage) {
      alert('Your session has expired. Please login again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <TimeTracker user={user} onLogout={handleLogout} />;
}
