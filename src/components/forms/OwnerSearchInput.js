// File: src/components/forms/OwnerSearchInput.js
// Search Vehicle Owner by NIC with autocomplete

'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function OwnerSearchInput({ onOwnerSelected, onOwnerNotFound }) {
  const [searchNic, setSearchNic] = useState('');
  const [loading, setLoading] = useState(false);
  const [foundOwner, setFoundOwner] = useState(null);

  const handleSearch = async () => {
    if (!searchNic.trim()) {
      toast.error('Please enter NIC number');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/vehicle-owners/search?nic=${searchNic}`);
      const data = await res.json();

      if (data.success && data.data.owner) {
        setFoundOwner(data.data.owner);
        onOwnerSelected(data.data.owner);
        toast.success('Owner found!');
      } else {
        setFoundOwner(null);
        onOwnerNotFound();
        toast.error('Owner not found. Create a new one?');
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
      <div className="flex gap-2">
        <input
          type="text"
          value={searchNic}
          onChange={(e) => setSearchNic(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Enter NIC number to search (e.g., 12345-6789)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {foundOwner && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="font-semibold text-green-900">{foundOwner.fullName}</p>
          <p className="text-sm text-green-700">NIC: {foundOwner.nicNumber}</p>
          <p className="text-sm text-green-700">Phone: {foundOwner.phoneNumber}</p>
          {foundOwner.vehicleTypes?.length > 0 && (
            <p className="text-sm text-green-700">
              Types: {foundOwner.vehicleTypes.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}