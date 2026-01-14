// File: src/app/dashboard/drivers/page.js
// Drivers Management Page

'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DriverForm from '@/components/forms/DriverForm';
import DriversTable from '@/components/tables/DriversTable';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  useEffect(() => {
    fetchOwners();
    fetchDrivers();
  }, [refreshTrigger]);

  const fetchOwners = async () => {
    try {
      const res = await fetch('/api/vehicle-owners/list');
      const data = await res.json();
      
      if (data.success) {
        setOwners(data.data);
      }
    } catch (error) {
      console.error('Fetch owners error:', error);
    }
  };

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/drivers/list');
      const data = await res.json();
      
      if (data.success) {
        setDrivers(data.data);
      } else {
        toast.error('Failed to fetch drivers');
      }
    } catch (error) {
      console.error('Fetch drivers error:', error);
      toast.error('Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleDriverCreated = () => {
    toast.success('Driver created successfully!');
    setShowCreateModal(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDriverUpdated = () => {
    toast.success('Driver updated successfully!');
    setShowEditModal(false);
    setEditingDriver(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEditDriver = (driver) => {
    setEditingDriver(driver);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingDriver(null);
  };

  const handleDeleteDriver = async (driverId) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) {
      return;
    }

    try {
      const res = await fetch(`/api/drivers/${driverId}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Driver deleted successfully');
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast.error(data.message || 'Failed to delete driver');
      }
    } catch (error) {
      console.error('Delete driver error:', error);
      toast.error('Failed to delete driver');
    }
  };

  return (
    <DashboardLayout>
      <Toaster position="top-center" />
      
      <div className="space-y-4 w-full max-w-full">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Drivers</h1>
            <p className="text-gray-600 mt-1">Manage vehicle drivers and their details</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add Driver</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Drivers Table */}
        <div className="w-full">
          <DriversTable 
            drivers={drivers} 
            loading={loading}
            onEditDriver={handleEditDriver}
            onDeleteDriver={handleDeleteDriver}
          />
        </div>
      </div>

      {/* Create Driver Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowCreateModal(false)}
          ></div>

          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col z-10 overflow-hidden">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <X size={24} />
            </button>

            <div className="p-6 px-8 flex-1 flex flex-col overflow-hidden">
              <DriverForm 
                onDriverCreated={handleDriverCreated}
                owners={owners}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Driver Modal */}
      {showEditModal && editingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={closeEditModal}
          ></div>

          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col z-10 overflow-hidden">
            <button
              onClick={closeEditModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <X size={24} />
            </button>

            <div className="p-6 px-8 flex-1 flex flex-col overflow-hidden">
              <DriverForm 
                onDriverUpdated={handleDriverUpdated}
                editingDriver={editingDriver}
                onCancelEdit={closeEditModal}
                owners={owners}
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}