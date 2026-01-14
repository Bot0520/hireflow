// FILE 1: src/components/forms/OwnerSearchStep.js

'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Plus } from 'lucide-react';

export default function OwnerSearchStep({ onOwnerSelected, onCreateNew }) {
  const [searchNic, setSearchNic] = useState('');
  const [loading, setLoading] = useState(false);
  const [foundOwner, setFoundOwner] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = async () => {
    if (!searchNic.trim()) {
      toast.error('Please enter NIC number');
      return;
    }

    setLoading(true);
    setSearchPerformed(true);

    try {
      const res = await fetch(`/api/vehicle-owners/search?nic=${searchNic}`);
      const data = await res.json();

      if (data.success && data.data.found) {
        setFoundOwner(data.data.owner);
        onOwnerSelected(data.data.owner);
        toast.success('Owner found!');
      } else {
        setFoundOwner(null);
        toast.error('Owner not found. Create new owner?');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search owner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Step 1: Search Vehicle Owner</h3>
        <p className="text-sm text-gray-600 mb-4">Find owner by NIC number or create new owner</p>
      </div>

      {/* Search Input */}
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={searchNic}
            onChange={(e) => {
              setSearchNic(e.target.value.toUpperCase());
              setSearchPerformed(false);
              setFoundOwner(null);
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter NIC (e.g., 12345-6789)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
            disabled={loading}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !searchNic.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
        >
          <Search size={18} />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {/* Found Owner */}
      {foundOwner && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-green-900">{foundOwner.fullName}</p>
              <p className="text-sm text-green-700">NIC: {foundOwner.nicNumber}</p>
              <p className="text-sm text-green-700">Phone: {foundOwner.phoneNumber}</p>
              {foundOwner.vehicleTypes?.length > 0 && (
                <p className="text-sm text-green-700">
                  Types: {foundOwner.vehicleTypes.join(', ')}
                </p>
              )}
            </div>
            <span className="inline-flex items-center justify-center w-8 h-8 bg-green-200 rounded-full text-green-700">✓</span>
          </div>
        </div>
      )}

      {/* Not Found */}
      {searchPerformed && !foundOwner && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800 mb-3">
            Owner not found in system. Create new owner?
          </p>
          <button
            onClick={onCreateNew}
            className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center justify-center gap-2 font-medium transition-colors"
          >
            <Plus size={18} />
            Create New Owner
          </button>
        </div>
      )}

      {/* Status */}
      {!foundOwner && searchPerformed && (
        <div className="text-center text-gray-500 text-sm">
          Owner not found. Please create a new owner or try different NIC.
        </div>
      )}
    </div>
  );
}