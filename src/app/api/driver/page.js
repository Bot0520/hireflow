// File: src/app/api/driver/page.js

'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { LogOut, MapPin, Clock, DollarSign, CheckCircle, Play, StopCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function DriverDashboardPage() {
  const [userData, setUserData] = useState(null);
  const [hires, setHires] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    active: 0,
    completed: 0,
    earnings: 0
  });
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const data = localStorage.getItem('userData');
    if (!data) {
      router.push('/');
      return;
    }
    const user = JSON.parse(data);
    if (user.role !== 'driver') {
      router.push('/dashboard');
      return;
    }
    setUserData(user);
    fetchHires();
  }, [router, refreshTrigger]);

  const fetchHires = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/driver/hires');
      const data = await res.json();
      
      if (data.success) {
        setHires(data.data.hires);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Fetch hires error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (hireId) => {
    try {
      const res = await fetch(`/api/driver/hires/${hireId}/accept`, {
        method: 'POST'
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Hire accepted!');
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to accept hire');
    }
  };

  const handleReject = async (hireId) => {
    try {
      const res = await fetch(`/api/driver/hires/${hireId}/reject`, {
        method: 'POST'
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Hire rejected');
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to reject hire');
    }
  };

  const handleStartTrip = async (hireId) => {
    try {
      const res = await fetch(`/api/driver/hires/${hireId}/start`, {
        method: 'POST'
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Trip started!');
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to start trip');
    }
  };

  const handleCompleteTrip = async (hireId, notes) => {
    try {
      const res = await fetch(`/api/driver/hires/${hireId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Trip completed!');
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to complete trip');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('userData');
    localStorage.removeItem('orgData');
    toast.success('Logged out successfully');
    router.push('/');
  };

  if (!userData) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🚗</span>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Driver Portal</h1>
              <p className="text-sm text-gray-600">{userData.name}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<Clock />} label="Pending" value={stats.pending} color="yellow" />
          <StatCard icon={<Play />} label="Active" value={stats.active} color="blue" />
          <StatCard icon={<CheckCircle />} label="Completed" value={stats.completed} color="green" />
          <StatCard icon={<DollarSign />} label="Earnings" value={`Rs. ${stats.earnings.toLocaleString()}`} color="purple" />
        </div>

        {/* Hires List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Your Hires</h2>
          
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : hires.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No hires assigned</div>
          ) : (
            hires.map(hire => (
              <HireCard 
                key={hire._id} 
                hire={hire}
                onAccept={handleAccept}
                onReject={handleReject}
                onStart={handleStartTrip}
                onComplete={handleCompleteTrip}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    yellow: 'bg-yellow-50 text-yellow-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className={`inline-flex p-2 rounded-lg ${colors[color]} mb-2`}>
        {icon}
      </div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function HireCard({ hire, onAccept, onReject, onStart, onComplete }) {
  const [notes, setNotes] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const getStatusBadge = () => {
    const badges = {
      active: { label: 'New Request', color: 'bg-yellow-100 text-yellow-800' },
      accepted: { label: 'Accepted', color: 'bg-blue-100 text-blue-800' },
      in_progress: { label: 'In Progress', color: 'bg-green-100 text-green-800' },
      completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800' }
    };
    
    const badge = badges[hire.status] || badges.active;
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>{badge.label}</span>;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Hire #{hire.hireId}</p>
          <p className="text-lg font-semibold text-gray-900">{hire.passengerName}</p>
        </div>
        {getStatusBadge()}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin size={16} className="mr-2" />
          <span><strong>From:</strong> {hire.pickupLocation}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin size={16} className="mr-2" />
          <span><strong>To:</strong> {hire.dropLocation}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock size={16} className="mr-2" />
          <span>{format(new Date(hire.dateTime), 'PPp')}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <DollarSign size={16} className="mr-2" />
          <span className="font-semibold">Rs. {hire.hirePrice.toLocaleString()}</span>
        </div>
        {hire.specialRequirements && (
          <p className="text-sm text-gray-600"><strong>Note:</strong> {hire.specialRequirements}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        {hire.status === 'active' && (
          <>
            <button
              onClick={() => onAccept(hire._id)}
              className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Accept
            </button>
            <button
              onClick={() => onReject(hire._id)}
              className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reject
            </button>
          </>
        )}
        
        {hire.status === 'accepted' && (
          <button
            onClick={() => onStart(hire._id)}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
          >
            <Play size={18} />
            <span>Start Trip</span>
          </button>
        )}
        
        {hire.status === 'in_progress' && (
          <button
            onClick={() => setShowCompleteModal(true)}
            className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
          >
            <StopCircle size={18} />
            <span>Complete Trip</span>
          </button>
        )}
      </div>

      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Complete Trip</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about the trip? (optional)"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onComplete(hire._id, notes);
                  setShowCompleteModal(false);
                  setNotes('');
                }}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}