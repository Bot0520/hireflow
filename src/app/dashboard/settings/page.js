// File: src/app/dashboard/settings/page.js

'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DatabaseResetPanel from '@/components/admin/DatabaseResetPanel';
import toast, { Toaster } from 'react-hot-toast';
import { Save, Plus, X } from 'lucide-react';

export default function SettingsPage() {
  const [userData, setUserData] = useState(null);
  const [pickupLocations, setPickupLocations] = useState([
    'Airport', 'City Center', 'Railway Station', 'Beach', 
    'Hotel District', 'Shopping Mall', 'Hospital', 'Bus Terminal'
  ]);
  const [dropLocations, setDropLocations] = useState([
    'Airport', 'City Center', 'Railway Station', 'Beach', 
    'Hotel District', 'Shopping Mall', 'Hospital', 'Bus Terminal'
  ]);
  const [newPickup, setNewPickup] = useState('');
  const [newDrop, setNewDrop] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem('userData');
    if (data) {
      setUserData(JSON.parse(data));
    }
  }, []);

  const handleAddPickup = () => {
    if (!newPickup.trim()) {
      toast.error('Please enter a location');
      return;
    }
    if (pickupLocations.includes(newPickup.trim())) {
      toast.error('Location already exists');
      return;
    }
    setPickupLocations([...pickupLocations, newPickup.trim()]);
    setNewPickup('');
    toast.success('Location added');
  };

  const handleRemovePickup = (location) => {
    setPickupLocations(pickupLocations.filter(l => l !== location));
    toast.success('Location removed');
  };

  const handleAddDrop = () => {
    if (!newDrop.trim()) {
      toast.error('Please enter a location');
      return;
    }
    if (dropLocations.includes(newDrop.trim())) {
      toast.error('Location already exists');
      return;
    }
    setDropLocations([...dropLocations, newDrop.trim()]);
    setNewDrop('');
    toast.success('Location added');
  };

  const handleRemoveDrop = (location) => {
    setDropLocations(dropLocations.filter(l => l !== location));
    toast.success('Location removed');
  };

  const handleSave = async () => {
    setLoading(true);
    
    // Simulate save
    setTimeout(() => {
      toast.success('Settings saved successfully!');
      setLoading(false);
    }, 1000);

    // TODO: Implement actual API call to save settings
  };

  // Check if user is super_admin
  const isSuperAdmin = userData?.role === 'super_admin';

  return (
    <DashboardLayout>
      <Toaster position="top-center" />
      
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your system preferences and configuration</p>
        </div>

        {/* Pickup Locations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Default Pickup Locations</h2>
          
          {/* Add New Location */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="text"
              value={newPickup}
              onChange={(e) => setNewPickup(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddPickup()}
              placeholder="Add new pickup location..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button
              onClick={handleAddPickup}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 transition-colors"
            >
              <Plus size={18} />
              <span>Add</span>
            </button>
          </div>

          {/* Location List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {pickupLocations.map((location, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-200"
              >
                <span className="text-gray-900">{location}</span>
                <button
                  onClick={() => handleRemovePickup(location)}
                  className="text-red-600 hover:text-red-700 transition-colors"
                  title="Remove location"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
          {pickupLocations.length === 0 && (
            <p className="text-gray-500 text-sm mt-4">No pickup locations added yet</p>
          )}
        </div>

        {/* Drop Locations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Default Drop Locations</h2>
          
          {/* Add New Location */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="text"
              value={newDrop}
              onChange={(e) => setNewDrop(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddDrop()}
              placeholder="Add new drop location..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button
              onClick={handleAddDrop}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 transition-colors"
            >
              <Plus size={18} />
              <span>Add</span>
            </button>
          </div>

          {/* Location List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {dropLocations.map((location, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-200"
              >
                <span className="text-gray-900">{location}</span>
                <button
                  onClick={() => handleRemoveDrop(location)}
                  className="text-red-600 hover:text-red-700 transition-colors"
                  title="Remove location"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
          {dropLocations.length === 0 && (
            <p className="text-gray-500 text-sm mt-4">No drop locations added yet</p>
          )}
        </div>

        {/* Save Button for Locations */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Save size={18} />
            <span>{loading ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

        {/* Divider */}
        {isSuperAdmin && (
          <>
            <div className="border-t border-gray-200"></div>

            {/* Admin Section Header */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Administration</h2>
              <p className="text-gray-600 mt-1">Super Admin only - Database and system management</p>
            </div>

            {/* Database Reset Panel */}
            <DatabaseResetPanel />
          </>
        )}

        {/* Non-Admin Notice */}
        {!isSuperAdmin && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <p className="text-sm text-blue-800">
              💡 <strong>Admin Features</strong> are only available to Super Admins. Contact your administrator if you need access to advanced settings.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}