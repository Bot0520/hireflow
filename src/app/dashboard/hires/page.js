// File: src/app/dashboard/hires/page.js

'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import HireForm from '@/components/forms/HireForm';
import EditHireForm from '@/components/forms/EditHireForm';
import HiresTable from '@/components/tables/HiresTable';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

export default function HiresPage() {
  const searchParams = useSearchParams();
  const queryView = searchParams.get('view'); // Get view from URL param
  
  const [view, setView] = useState(queryView || 'active');
  const [hires, setHires] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHire, setEditingHire] = useState(null);
  const [toastShown, setToastShown] = useState(false);

  // Update view when URL query param changes
  useEffect(() => {
    if (queryView) {
      setView(queryView);
    }
  }, [queryView]);

  useEffect(() => {
    fetchHires();
  }, [view, refreshTrigger]);

  const fetchHires = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hires/list?view=${view}`);
      const data = await res.json();
      
      if (data.success) {
        setHires(data.data);
      } else {
        toast.error('Failed to fetch hires');
      }
    } catch (error) {
      console.error('Fetch hires error:', error);
      toast.error('Failed to fetch hires');
    } finally {
      setLoading(false);
    }
  };

  const handleHireCreated = () => {
    if (!toastShown) {
      toast.success('Hire created successfully!');
      setToastShown(true);
    }
    setShowCreateModal(false);
    setRefreshTrigger(prev => prev + 1);
    // Reset toast flag after modal closes
    setTimeout(() => setToastShown(false), 500);
  };

  const handleHireUpdated = () => {
    toast.success('Hire updated successfully!');
    setShowEditModal(false);
    setEditingHire(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEditHire = (hire) => {
    setEditingHire(hire);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingHire(null);
  };

  const handleTableUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <DashboardLayout>
      <Toaster position="top-center" />
      
      <div className="space-y-4 w-full max-w-full">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Hire Management</h1>
            <p className="text-gray-600 mt-1">Create and manage vehicle hire requests</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Create New Hire</span>
            <span className="sm:hidden">Create</span>
          </button>
        </div>

        {/* View Toggle Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setView('active')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              view === 'active'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Active Hires
          </button>
          <button
            onClick={() => setView('completed')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              view === 'completed'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Completed Hires
          </button>
        </div>

        {/* Hires Table */}
        <div className="w-full">
          <HiresTable 
            hires={hires} 
            loading={loading} 
            view={view}
            onHireUpdated={handleTableUpdate}
            onEditHire={handleEditHire}
          />
        </div>
      </div>

      {/* Create Hire Modal */}
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
              <HireForm onHireCreated={handleHireCreated} />
            </div>
          </div>
        </div>
      )}

      {/* Edit Hire Modal */}
      {showEditModal && editingHire && (
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
              <EditHireForm 
                hire={editingHire} 
                onHireUpdated={handleHireUpdated}
                onCancel={closeEditModal}
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}