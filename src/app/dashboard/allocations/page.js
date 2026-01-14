// File: src/app/dashboard/allocations/page.js

'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import toast, { Toaster } from 'react-hot-toast';
import { format } from 'date-fns';
import { MapPin, Clock, DollarSign, CheckCircle, AlertCircle, Phone, Car } from 'lucide-react';

export default function DriverAllocationsPage() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [expandedOwners, setExpandedOwners] = useState(new Set());

  useEffect(() => {
    fetchAllocations();
  }, [filter]);

  const fetchAllocations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/allocations/list-by-owner?filter=${filter}`);
      const data = await res.json();
      
      if (data.success) {
        setAllocations(data.data);
        // Auto-expand all owners
        const ownerNics = data.data.map(a => a.ownerNic);
        setExpandedOwners(new Set(ownerNics));
      } else {
        toast.error('Failed to fetch allocations');
      }
    } catch (error) {
      console.error('Fetch allocations error:', error);
      toast.error('Failed to fetch allocations');
    } finally {
      setLoading(false);
    }
  };

  const toggleOwnerExpand = (ownerNic) => {
    const newExpanded = new Set(expandedOwners);
    if (newExpanded.has(ownerNic)) {
      newExpanded.delete(ownerNic);
    } else {
      newExpanded.add(ownerNic);
    }
    setExpandedOwners(newExpanded);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      accepted: { label: 'Accepted', color: 'bg-green-100 text-green-800' },
      in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800' },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
    };
    
    const badge = badges[status] || badges.pending;
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>{badge.label}</span>;
  };

  return (
    <DashboardLayout>
      <Toaster position="top-center" />
      
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Driver Allocations</h1>
          <p className="text-gray-600 mt-1">Manage hire allocations grouped by vehicle owner</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-3 flex-wrap">
          {['all', 'pending', 'accepted', 'in_progress'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Allocations List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading allocations...</p>
            </div>
          ) : allocations.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
              No allocations found
            </div>
          ) : (
            <div className="space-y-4">
              {allocations.map((ownerGroup) => (
                <div key={ownerGroup.ownerNic} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Owner Header */}
                  <button
                    onClick={() => toggleOwnerExpand(ownerGroup.ownerNic)}
                    className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 text-left">
                      <div>
                        <p className="font-semibold text-gray-900">{ownerGroup.ownerName}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>NIC: {ownerGroup.ownerNic}</span>
                          <a
                            href={`tel:${ownerGroup.ownerPhone}`}
                            className="flex items-center gap-1 text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Phone size={14} />
                            {ownerGroup.ownerPhone}
                          </a>
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700">
                      {ownerGroup.vehicles.reduce((sum, v) => sum + v.hires.length, 0)} hires
                    </span>
                  </button>

                  {/* Vehicles & Hires */}
                  {expandedOwners.has(ownerGroup.ownerNic) && (
                    <div className="divide-y divide-gray-200">
                      {ownerGroup.vehicles.map((vehicle) => (
                        <div key={vehicle.vehicleNumber} className="p-4">
                          {/* Vehicle Header */}
                          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                            <Car size={18} className="text-blue-600" />
                            <div>
                              <p className="font-semibold text-gray-900">{vehicle.vehicleNumber}</p>
                              <p className="text-sm text-gray-600">{vehicle.vehicleType} • {vehicle.capacity} passengers</p>
                            </div>
                          </div>

                          {/* Hires for this vehicle */}
                          <div className="space-y-3">
                            {vehicle.hires.map((hire) => (
                              <HireAllocationCard
                                key={hire._id}
                                hire={hire}
                                onAccept={() => fetchAllocations()}
                                onCancel={() => fetchAllocations()}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function HireAllocationCard({ hire, onAccept, onCancel }) {
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleAccept = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/allocations/${hire._id}/accept`, {
        method: 'POST'
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Hire accepted!');
        setShowAcceptDialog(false);
        onAccept();
      } else {
        toast.error(data.message || 'Failed to accept hire');
      }
    } catch (error) {
      toast.error('Failed to accept hire');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please enter cancellation reason');
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch(`/api/allocations/${hire._id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Hire cancelled!');
        setShowCancelDialog(false);
        setCancelReason('');
        onCancel();
      } else {
        toast.error(data.message || 'Failed to cancel hire');
      }
    } catch (error) {
      toast.error('Failed to cancel hire');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900">Hire #{hire.hireId}</p>
          <p className="text-sm text-gray-600">{hire.passengerName}</p>
        </div>
        <div className="flex items-center gap-2">
          {hire.commission?.managerCommission > 0 && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
              Rs. {hire.commission.managerCommission.toFixed(0)}
            </span>
          )}
          {hire.status === 'pending' && (
            <AlertCircle size={18} className="text-yellow-600" />
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex items-center gap-2 text-gray-700">
          <MapPin size={16} className="text-gray-400" />
          <span>{hire.pickupLocation} → {hire.dropLocation}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Clock size={16} className="text-gray-400" />
          <span>{format(new Date(hire.dateTime), 'MMM dd, yyyy HH:mm')}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <DollarSign size={16} className="text-gray-400" />
          <span>Rs. {hire.hirePrice.toLocaleString()}</span>
        </div>
      </div>

      <div className="mb-4 pb-4 border-b border-gray-300">
        {hire.status === 'pending' && (
          <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            Pending - Awaiting your confirmation
          </span>
        )}
        {hire.status === 'accepted' && (
          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Accepted - Driver will execute
          </span>
        )}
        {hire.status === 'in_progress' && (
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            In Progress - Trip ongoing
          </span>
        )}
        {hire.status === 'completed' && (
          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            Completed
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {hire.status === 'pending' && (
          <>
            <button
              onClick={() => setShowAcceptDialog(true)}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
            >
              Accept
            </button>
            <button
              onClick={() => setShowCancelDialog(true)}
              className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </>
        )}
        {hire.status === 'accepted' && (
          <button
            onClick={() => setShowCancelDialog(true)}
            className="flex-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium transition-colors"
          >
            Cancel Hire
          </button>
        )}
        {hire.status === 'in_progress' && (
          <button
            onClick={() => setShowCancelDialog(true)}
            className="flex-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium transition-colors"
          >
            Cancel Trip
          </button>
        )}
      </div>

      {/* Accept Dialog */}
      {showAcceptDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Hire Acceptance</h3>
            <p className="text-gray-700 mb-2">Hire: <strong>{hire.hireId}</strong></p>
            <p className="text-gray-700 mb-6">Passenger: <strong>{hire.passengerName}</strong></p>
            <p className="text-sm text-blue-700 mb-6 bg-blue-50 p-3 rounded-lg">
              ✓ Once accepted, this hire will move to "Accepted" status and driver can begin execution.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAcceptDialog(false)}
                disabled={processing}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAccept}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Accept Hire'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Hire</h3>
            <p className="text-gray-700 mb-4">Hire: <strong>{hire.hireId}</strong></p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-gray-900"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelDialog(false);
                  setCancelReason('');
                }}
                disabled={processing}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
              >
                Keep Hire
              </button>
              <button
                onClick={handleCancel}
                disabled={processing || !cancelReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
              >
                {processing ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}