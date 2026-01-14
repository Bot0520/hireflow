// File: src/app/driver/portal/page.js
// Driver portal with organization grouping
// Shows hires grouped by hotel/organization

'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { LogOut, MapPin, Clock, DollarSign, CheckCircle, Play, StopCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';

export default function DriverPortal() {
  const [userData, setUserData] = useState(null);
  const [hiresByOrg, setHiresByOrg] = useState({});
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
      const res = await fetch('/api/driver/hires/by-org');
      const data = await res.json();
      
      if (data.success) {
        setHiresByOrg(data.data.hiresByOrg);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Fetch hires error:', error);
      toast.error('Failed to fetch hires');
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

  const handleReturnHire = async (hireId, reason) => {
    try {
      const res = await fetch(`/api/driver/hires/${hireId}/cancel-return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Hire returned to manager');
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to return hire');
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

  const orgList = Object.keys(hiresByOrg);

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
            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

        {/* Hires by Organization */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : orgList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No hires assigned</div>
          ) : (
            orgList.map(orgName => (
              <div key={orgName} className="space-y-4">
                {/* Organization Header */}
                <div className="bg-blue-600 text-white px-6 py-3 rounded-lg">
                  <h2 className="text-lg font-semibold">🏨 {orgName}</h2>
                  <p className="text-blue-100 text-sm">{hiresByOrg[orgName].length} hire(s)</p>
                </div>

                {/* Hires for this organization */}
                <div className="space-y-4">
                  {hiresByOrg[orgName].map(hire => (
                    <HireCard 
                      key={hire._id} 
                      hire={hire}
                      onAccept={handleAccept}
                      onReject={handleReject}
                      onStart={handleStartTrip}
                      onComplete={handleCompleteTrip}
                      onReturn={handleReturnHire}
                    />
                  ))}
                </div>
              </div>
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

function HireCard({ hire, onAccept, onReject, onStart, onComplete, onReturn }) {
  const [notes, setNotes] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');

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
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Hire #{hire.hireId}</p>
          <p className="text-lg font-semibold text-gray-900">{hire.passengerName}</p>
        </div>
        {getStatusBadge()}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin size={16} className="mr-2 flex-shrink-0" />
          <span><strong>From:</strong> {hire.pickupLocation}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin size={16} className="mr-2 flex-shrink-0" />
          <span><strong>To:</strong> {hire.dropLocation}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock size={16} className="mr-2 flex-shrink-0" />
          <span>{format(new Date(hire.dateTime), 'PPp')}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <DollarSign size={16} className="mr-2 flex-shrink-0" />
          <span className="font-semibold">Rs. {hire.hirePrice.toLocaleString()}</span>
        </div>
        {hire.specialRequirements && (
          <p className="text-sm text-gray-600"><strong>Note:</strong> {hire.specialRequirements}</p>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2 md:space-y-0 md:flex md:space-x-2">
        {hire.status === 'active' && (
          <>
            <button
              onClick={() => onAccept(hire._id)}
              className="w-full md:flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Accept
            </button>
            <button
              onClick={() => onReject(hire._id)}
              className="w-full md:flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reject
            </button>
          </>
        )}
        
        {hire.status === 'accepted' && (
          <>
            <button
              onClick={() => onStart(hire._id)}
              className="w-full md:flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 transition-colors"
            >
              <Play size={18} />
              <span>Start Trip</span>
            </button>
            <button
              onClick={() => setShowReturnModal(true)}
              className="w-full md:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center space-x-2 transition-colors"
            >
              <RotateCcw size={18} />
              <span>Return</span>
            </button>
          </>
        )}
        
        {hire.status === 'in_progress' && (
          <>
            <button
              onClick={() => setShowCompleteModal(true)}
              className="w-full md:flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 transition-colors"
            >
              <StopCircle size={18} />
              <span>Complete Trip</span>
            </button>
            <button
              onClick={() => setShowReturnModal(true)}
              className="w-full md:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center space-x-2 transition-colors"
            >
              <RotateCcw size={18} />
              <span>Return</span>
            </button>
          </>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCompleteModal(false);
                  setNotes('');
                }}
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onComplete(hire._id, notes);
                  setShowCompleteModal(false);
                  setNotes('');
                }}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Hire Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center space-x-2 mb-4">
              <AlertCircle className="text-orange-600" size={24} />
              <h3 className="text-lg font-semibold">Return Hire to Manager</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              This will return the hire to the manager for reassignment.
            </p>
            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Reason for returning (required)"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowReturnModal(false);
                  setReturnReason('');
                }}
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Keep Hire
              </button>
              <button
                onClick={() => {
                  if (!returnReason.trim()) {
                    toast.error('Please enter a reason');
                    return;
                  }
                  onReturn(hire._id, returnReason);
                  setShowReturnModal(false);
                  setReturnReason('');
                }}
                className="flex-1 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Return Hire
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}