// File: src/app/dashboard/vehicles/page.js

'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import VehicleForm from '@/components/forms/VehicleForm';
import VehiclesTable from '@/components/tables/VehiclesTable';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, [refreshTrigger]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vehicles/list');
      const data = await res.json();

      if (data.success) {
        setVehicles(data.data);
      } else {
        toast.error('Failed to fetch vehicles');
      }
    } catch (error) {
      console.error('Fetch vehicles error:', error);
      toast.error('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleCreated = () => {
    setShowModal(false);
    setRefreshTrigger(prev => prev + 1);
    toast.success('Vehicle created successfully!');
  };

  return (
    <DashboardLayout>
      <Toaster position="top-center" />

      <div className="space-y-4 w-full max-w-full">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Vehicles</h1>
            <p className="text-gray-600 mt-1">Manage your fleet vehicles grouped by owner</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add New Vehicle</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Vehicles Table */}
        <div className="w-full">
          <VehiclesTable
            vehicles={vehicles}
            loading={loading}
            onEdit={() => toast.info('Edit functionality coming soon')}
            onVehicleUpdated={() => setRefreshTrigger(prev => prev + 1)}
          />
        </div>
      </div>

      {/* Create Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowModal(false)}
          ></div>

          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col z-10 overflow-hidden">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <X size={24} />
            </button>

            <div className="p-6 flex-1 flex flex-col overflow-hidden">
              <VehicleForm
                onVehicleCreated={handleVehicleCreated}
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}