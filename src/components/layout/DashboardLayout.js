// File: src/components/layout/DashboardLayout.js
// UPDATED: Remove Vehicles submenu, add Owner & Driver as main tabs

'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  Users,
  Car,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardLayout({ children }) {
  const [userData, setUserData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const data = localStorage.getItem('userData');
    if (!data) {
      router.push('/');
      return;
    }
    setUserData(JSON.parse(data));
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('userData');
      localStorage.removeItem('orgData');
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  // MAIN TABS (NO SUBMENUS)
  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Vehicle Owners', href: '/dashboard/vehicle-owners' },
    { icon: User, label: 'Drivers', href: '/dashboard/drivers' },
    { icon: Car, label: 'Vehicles', href: '/dashboard/vehicles' },
    { icon: FileText, label: 'Hires', href: '/dashboard/hires' },
    { icon: Users, label: 'Driver Allocations', href: '/dashboard/allocations' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' }
  ];

  const isActive = (href) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🚗</span>
            <span className="font-bold text-xl text-blue-600">HireFlow</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-gray-100 text-red-600"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:relative lg:flex-shrink-0 w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">🚗</span>
              <div>
                <h1 className="font-bold text-xl text-blue-600">HireFlow</h1>
                <p className="text-xs text-gray-500">{userData.organizationName}</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userData.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userData.role === 'super_admin' ? 'Super Admin' : 'Manager'}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items - NO SUBMENUS */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 min-h-screen w-full lg:overflow-y-auto">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}