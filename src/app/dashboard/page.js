// File: src/app/dashboard/page.js

'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import { FileText, Car, CheckCircle, Clock } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalHires: 0,
    activeHires: 0,
    completedHires: 0,
    totalVehicles: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            icon={<FileText className="text-blue-600" size={24} />}
            title="Total Hires"
            value={loading ? '...' : stats.totalHires}
            bgColor="bg-blue-50"
          />
          <StatsCard
            icon={<Clock className="text-yellow-600" size={24} />}
            title="Active Hires"
            value={loading ? '...' : stats.activeHires}
            bgColor="bg-yellow-50"
          />
          <StatsCard
            icon={<CheckCircle className="text-green-600" size={24} />}
            title="Completed"
            value={loading ? '...' : stats.completedHires}
            bgColor="bg-green-50"
          />
          <StatsCard
            icon={<Car className="text-purple-600" size={24} />}
            title="Vehicles"
            value={loading ? '...' : stats.totalVehicles}
            bgColor="bg-purple-50"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickActionCard
              title="Create New Hire"
              description="Add a new vehicle hire request"
              href="/dashboard/hires"
              color="blue"
            />
            <QuickActionCard
              title="View Active Hires"
              description="See all ongoing hire requests"
              href="/dashboard/hires?view=active"
              color="yellow"
            />
            <QuickActionCard
              title="Manage Vehicles"
              description="Add or edit vehicle information"
              href="/dashboard/vehicles"
              color="purple"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatsCard({ icon, title, value, bgColor }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function QuickActionCard({ title, description, href, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700',
    yellow: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-700',
    purple: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700'
  };

  return (
    <Link
      href={href}
      className={`block p-4 rounded-lg border-2 transition-colors ${colorClasses[color]}`}
    >
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm opacity-80">{description}</p>
    </Link>
  );
}