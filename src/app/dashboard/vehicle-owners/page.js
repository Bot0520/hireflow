// File: src/app/dashboard/vehicle-owners/page.js
// Vehicle Owners Management Page

'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import VehicleOwnerForm from '@/components/forms/VehicleOwnerForm';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, X, Phone, Car, Users, FileText } from 'lucide-react';

export default function VehicleOwnersPage() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchNic, setSearchNic] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchOwners();
  }, [refreshTrigger]);

  const fetchOwners = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/company-owners/list');
      const data = await res.json();

      if (data.success) {
        setOwners(data.data);
      } else {
        toast.error('Failed to fetch owners');
      }
    } catch (error) {
      console.error('Fetch owners error:', error);
      toast.error('Failed to fetch owners');
    } finally {
      setLoading(false);
    }
  };

  const handleOwnerCreated = () => {
    setShowCreateModal(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSearch = async () => {
    if (!searchNic.trim()) {
      toast.error('Please enter NIC number');
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/vehicle-owners/search?nic=${searchNic}`);
      const data = await res.json();

      if (data.success && data.data.found) {
        setSearchResult(data.data);
        if (data.data.alreadyInCompany) {
          toast.info('This owner is already in your company');
        }
      } else {
        toast.error('Owner not found');
        setSearchResult(null);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search owner');
    } finally {
      setSearching(false);
    }
  };

  const handleAddOwner = async () => {
    if (!searchResult?.owner?.nicNumber) {
      toast.error('Invalid owner selected');
      return;
    }

    try {
      const res = await fetch('/api/company-owners/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerNic: searchResult.owner.nicNumber })
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Owner added to your company successfully!');
        setShowAddModal(false);
        setSearchNic('');
        setSearchResult(null);
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast.error(data.message || 'Failed to add owner');
      }
    } catch (error) {
      console.error('Add owner error:', error);
      toast.error('Failed to add owner');
    }
  };

  return (
    <DashboardLayout>
      <Toaster position="top-center" />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Vehicle Owners</h1>
            <p className="text-gray-600 mt-1">Manage vehicle owners in your company</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              + Add Existing
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Create New</span>
            </button>
          </div>
        </div>

        {/* Owners Grid */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading owners...</p>
          </div>
        ) : owners.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
            No vehicle owners found. Create your first owner to get started!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {owners.map((owner) => (
              <div key={owner._id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{owner.ownerName}</h3>
                    <p className="text-sm text-gray-600">NIC: {owner.ownerNic}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    owner.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {owner.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone size={16} className="text-blue-600" />
                    <a href={`tel:${owner.ownerPhone}`} className="hover:underline">
                      {owner.ownerPhone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Car size={16} className="text-blue-600" />
                    <span>{owner.vehicleCount} vehicle{owner.vehicleCount !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users size={16} className="text-blue-600" />
                    <span>{owner.driverCount} driver{owner.driverCount !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FileText size={16} className="text-blue-600" />
                    <span>{owner.hireCount} hire{owner.hireCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                {owner.vehicleTypes?.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">Vehicle Types:</p>
                    <div className="flex flex-wrap gap-1">
                      {owner.vehicleTypes.map((type) => (
                        <span key={type} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create New Owner Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowCreateModal(false)}></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col z-10 overflow-hidden">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
            >
              <X size={24} />
            </button>
            <div className="p-6 flex-1 flex flex-col overflow-hidden">
              <VehicleOwnerForm onOwnerCreated={handleOwnerCreated} />
            </div>
          </div>
        </div>
      )}

      {/* Add Existing Owner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddModal(false)}></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md z-10 p-6">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Add Existing Owner</h3>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchNic}
                  onChange={(e) => setSearchNic(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter NIC number"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <button
                  onClick={handleSearch}
                  disabled={searching}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  Search
                </button>
              </div>

              {searchResult?.found && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="font-semibold text-green-900 mb-2">{searchResult.owner.fullName}</p>
                  <p className="text-sm text-green-700">NIC: {searchResult.owner.nicNumber}</p>
                  <p className="text-sm text-green-700">Phone: {searchResult.owner.phoneNumber}</p>
                  {searchResult.alreadyInCompany && (
                    <p className="text-sm text-yellow-700 mt-2">✓ Already in your company</p>
                  )}
                </div>
              )}

              {searchResult?.found && !searchResult.alreadyInCompany && (
                <button
                  onClick={handleAddOwner}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Add to My Company
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}