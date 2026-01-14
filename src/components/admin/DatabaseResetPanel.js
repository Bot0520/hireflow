// File: src/components/admin/DatabaseResetPanel.js

'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AlertTriangle, Trash2, CheckCircle } from 'lucide-react';

export default function DatabaseResetPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [resetComplete, setResetComplete] = useState(false);

  const CONFIRMATION_TEXT = 'DELETE ALL DATA';

  useEffect(() => {
    fetchResetStats();
  }, []);

  const fetchResetStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/reset-db-confirm');
      const data = await res.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
      toast.error('Failed to fetch reset stats');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    // Validate confirmation text
    if (confirmText !== CONFIRMATION_TEXT) {
      toast.error(`Please type exactly: "${CONFIRMATION_TEXT}"`);
      return;
    }

    setResetting(true);

    try {
      const res = await fetch('/api/admin/reset-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmReset: true,
          organizationId: stats?.stats?.organizationId
        })
      });

      const data = await res.json();

      if (data.success) {
        setResetComplete(true);
        setShowConfirmDialog(false);
        setConfirmText('');
        toast.success(`Reset successful! Deleted ${data.data.deletedHires} hires and ${data.data.deletedVehicles} vehicles`);
        
        // Refresh stats after 2 seconds
        setTimeout(() => {
          fetchResetStats();
          setResetComplete(false);
        }, 2000);
      } else {
        toast.error(data.message || 'Failed to reset database');
      }
    } catch (error) {
      console.error('Reset error:', error);
      toast.error('Failed to reset database');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-red-200 p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-red-100 rounded-lg">
          <AlertTriangle className="text-red-600" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Danger Zone</h3>
          <p className="text-sm text-gray-600">Reset all hires and vehicles data</p>
        </div>
      </div>

      {/* Warning Box */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-red-800 font-medium mb-2">⚠️ Warning:</p>
        <ul className="text-sm text-red-700 space-y-1 ml-4">
          <li>✓ This will delete ALL hires and vehicles</li>
          <li>✓ Organization and user data will remain</li>
          <li>✓ This action CANNOT be undone</li>
          <li>✓ Make sure to backup data before proceeding</li>
        </ul>
      </div>

      {/* Stats */}
      {stats?.stats && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Hires to Delete</p>
            <p className="text-2xl font-bold text-blue-600">{stats.stats.totalHires}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Vehicles to Delete</p>
            <p className="text-2xl font-bold text-purple-600">{stats.stats.totalVehicles}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {resetComplete && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center space-x-3">
          <CheckCircle className="text-green-600" size={20} />
          <div>
            <p className="font-medium text-green-800">Database Reset Complete!</p>
            <p className="text-sm text-green-700">All hires and vehicles have been deleted.</p>
          </div>
        </div>
      )}

      {/* Action Button */}
      {!resetComplete && (
        <button
          onClick={() => setShowConfirmDialog(true)}
          disabled={resetting}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 size={18} />
          <span>{resetting ? 'Resetting...' : 'Reset Database'}</span>
        </button>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="text-red-600" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Reset</h3>
            </div>

            {/* Message */}
            <p className="text-gray-700 mb-4">
              You are about to delete <strong>{stats?.stats?.totalHires}</strong> hires and <strong>{stats?.stats?.totalVehicles}</strong> vehicles.
            </p>

            <p className="text-sm text-red-600 font-medium mb-4">
              This action is permanent and cannot be undone.
            </p>

            {/* Confirmation Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-mono bg-gray-100 px-2 py-1 rounded">{CONFIRMATION_TEXT}</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type confirmation text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setConfirmText('');
                }}
                disabled={resetting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={resetting || confirmText !== CONFIRMATION_TEXT}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {resetting ? 'Resetting...' : 'Yes, Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}