// File: src/components/tables/HiresTable.js

'use client';
import { useState } from 'react';
import { format } from 'date-fns';
import { Eye, X, CheckCircle, XCircle, Edit, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HiresTable({ hires, loading, view, onHireUpdated, onEditHire }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancelModal, setCancelModal] = useState({ open: false, hireId: null });
  const [cancelReason, setCancelReason] = useState('');
  const [detailModal, setDetailModal] = useState({ open: false, hire: null });

  const filteredHires = statusFilter === 'all' 
    ? hires 
    : hires.filter(hire => hire.status === statusFilter);

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      in_progress: 'In Progress'
    };
    
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status] || status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleCancelHire = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please enter cancellation reason');
      return;
    }

    try {
      const res = await fetch(`/api/hires/${cancelModal.hireId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'cancelled',
          cancellationReason: cancelReason
        })
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Hire cancelled successfully');
        setCancelModal({ open: false, hireId: null });
        setCancelReason('');
        onHireUpdated();
      } else {
        toast.error(data.message || 'Failed to cancel hire');
      }
    } catch (error) {
      console.error('Cancel hire error:', error);
      toast.error('Failed to cancel hire');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading hires...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={statusFilter === 'all'}
              onClick={() => setStatusFilter('all')}
              label="All"
            />
            {view === 'active' && (
              <>
                <FilterButton
                  active={statusFilter === 'active'}
                  onClick={() => setStatusFilter('active')}
                  label="Active"
                />
                <FilterButton
                  active={statusFilter === 'pending'}
                  onClick={() => setStatusFilter('pending')}
                  label="Pending"
                />
                <FilterButton
                  active={statusFilter === 'accepted'}
                  onClick={() => setStatusFilter('accepted')}
                  label="Accepted"
                />
                <FilterButton
                  active={statusFilter === 'in_progress'}
                  onClick={() => setStatusFilter('in_progress')}
                  label="In Progress"
                />
              </>
            )}
            {view === 'completed' && (
              <>
                <FilterButton
                  active={statusFilter === 'completed'}
                  onClick={() => setStatusFilter('completed')}
                  label="Completed"
                />
                <FilterButton
                  active={statusFilter === 'cancelled'}
                  onClick={() => setStatusFilter('cancelled')}
                  label="Cancelled"
                />
              </>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hire ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passenger</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drop</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHires.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">No hires found</td>
                </tr>
              ) : (
                filteredHires.map((hire) => (
                  <tr key={hire._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">{hire.hireId}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{hire.passengerName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{hire.pickupLocation}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{hire.dropLocation}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(hire.dateTime), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">Rs. {hire.hirePrice.toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(hire.status)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setDetailModal({ open: true, hire })}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {hire.status !== 'cancelled' && hire.status !== 'completed' && (
                          <>
                            <button
                              onClick={() => onEditHire && onEditHire(hire)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                              title="Edit Hire"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => setCancelModal({ open: true, hireId: hire._id })}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              title="Cancel Hire"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-600">
          Showing {filteredHires.length} of {hires.length} hires
        </div>
      </div>

      {/* CANCEL MODAL - FIXED VISIBILITY */}
      {cancelModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            {/* Header with Icon */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-red-100">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Cancel Hire</h3>
            </div>
            
            {/* Description */}
            <p className="text-sm text-gray-700 mb-4">
              Please provide a reason for cancellation. This will be recorded in the system.
            </p>

            {/* Textarea with dark text */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Cancellation Reason <span className="text-red-600">*</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-gray-900 placeholder-gray-500 bg-white"
                placeholder="Example: Driver unavailable, vehicle issue, etc."
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCancelModal({ open: false, hireId: null });
                  setCancelReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Keep Hire
              </button>
              <button
                onClick={handleCancelHire}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailModal.open && detailModal.hire && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Hire Details</h3>
              <button
                onClick={() => setDetailModal({ open: false, hire: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <DetailRow label="Hire ID" value={detailModal.hire.hireId} />
              <DetailRow label="Passenger Name" value={detailModal.hire.passengerName} />
              <DetailRow label="Pickup Location" value={detailModal.hire.pickupLocation} />
              <DetailRow label="Drop Location" value={detailModal.hire.dropLocation} />
              <DetailRow 
                label="Date & Time" 
                value={format(new Date(detailModal.hire.dateTime), 'PPpp')} 
              />
              <DetailRow label="Number of Passengers" value={detailModal.hire.numberOfPassengers} />
              <DetailRow label="Hire Price" value={`Rs. ${detailModal.hire.hirePrice.toLocaleString()}`} />
              <DetailRow label="Status" value={getStatusBadge(detailModal.hire.status)} />
              {detailModal.hire.specialRequirements && (
                <DetailRow label="Special Requirements" value={detailModal.hire.specialRequirements} />
              )}
              {detailModal.hire.cancellationReason && (
                <DetailRow label="Cancellation Reason" value={detailModal.hire.cancellationReason} />
              )}
              {detailModal.hire.vehicleId && (
                <DetailRow 
                  label="Assigned Vehicle" 
                  value={`${detailModal.hire.vehicleId.vehicleNumber} (${detailModal.hire.vehicleId.driverName})`} 
                />
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setDetailModal({ open: false, hire: null })}
                className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FilterButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex border-b border-gray-100 pb-2">
      <span className="font-medium text-gray-900 w-1/3">{label}:</span>
      <span className="text-gray-900 w-2/3">{value}</span>
    </div>
  );
}