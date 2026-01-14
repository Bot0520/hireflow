// File: src/components/forms/VehicleOwnerForm.js
// Create/Edit Vehicle Owner Form

'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function VehicleOwnerForm({ onOwnerCreated, onOwnerUpdated, editingOwner, onCancelEdit }) {
  const [formData, setFormData] = useState({
    nicNumber: '',
    fullName: '',
    phoneNumber: '',
    whatsappNumber: '',
    vehicleTypes: [],
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  const vehicleTypes = ['Car', 'Van', 'SUV', 'Bus', 'Other'];

  useEffect(() => {
    if (editingOwner) {
      setFormData({
        nicNumber: editingOwner.nicNumber || '',
        fullName: editingOwner.fullName || '',
        phoneNumber: editingOwner.phoneNumber || '',
        whatsappNumber: editingOwner.whatsappNumber || '',
        vehicleTypes: editingOwner.vehicleTypes || [],
        notes: editingOwner.notes || ''
      });
    }
  }, [editingOwner]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVehicleTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      vehicleTypes: prev.vehicleTypes.includes(type)
        ? prev.vehicleTypes.filter(t => t !== type)
        : [...prev.vehicleTypes, type]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nicNumber || !formData.fullName || !formData.phoneNumber) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const url = editingOwner 
        ? `/api/vehicle-owners/${editingOwner._id}` 
        : '/api/vehicle-owners/create';
      
      const method = editingOwner ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        setFormData({
          nicNumber: '',
          fullName: '',
          phoneNumber: '',
          whatsappNumber: '',
          vehicleTypes: [],
          notes: ''
        });
        
        if (editingOwner) {
          onOwnerUpdated();
        } else {
          onOwnerCreated();
        }
      } else {
        toast.error(data.message || 'Failed to save owner');
      }
    } catch (error) {
      console.error('Save owner error:', error);
      toast.error('Failed to save owner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="flex-shrink-0 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          {editingOwner ? 'Edit Vehicle Owner' : 'Add New Vehicle Owner'}
        </h2>
      </div>

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto py-4 min-h-0 -mx-1 px-1">
        <div className="space-y-4">
          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* NIC Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIC Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nicNumber"
                value={formData.nicNumber}
                onChange={handleChange}
                disabled={!!editingOwner}
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-400 disabled:bg-gray-50"
                placeholder="e.g., 12345-6789"
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-400"
                placeholder="Owner's full name"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-400"
                placeholder="+94771234567"
              />
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Number
              </label>
              <input
                type="tel"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleChange}
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-400"
                placeholder="+94771234567"
              />
            </div>
          </div>

          {/* Vehicle Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Types
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {vehicleTypes.map(type => (
                <label key={type} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.vehicleTypes.includes(type)}
                    onChange={() => handleVehicleTypeChange(type)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              autoComplete="off"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-400 resize-none"
              placeholder="Any additional notes..."
            ></textarea>
          </div>
        </div>
      </div>

      {/* Fixed Submit Button */}
      <div className="flex-shrink-0 pt-4 border-t border-gray-200">
        <div className="flex justify-end space-x-3">
          {editingOwner && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Saving...' : editingOwner ? 'Update Owner' : 'Add Owner'}
          </button>
        </div>
      </div>
    </form>
  );
}