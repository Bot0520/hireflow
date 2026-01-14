// File: src/components/forms/DriverForm.js
// Create/Edit Driver Form

'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function DriverForm({ onDriverCreated, onDriverUpdated, editingDriver, onCancelEdit, owners }) {
  const [formData, setFormData] = useState({
    ownerNic: '',
    fullName: '',
    phoneNumber: '',
    whatsappNumber: '',
    licenseNumber: '',
    licenseExpiry: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingDriver) {
      setFormData({
        ownerNic: editingDriver.ownerNic || '',
        fullName: editingDriver.fullName || '',
        phoneNumber: editingDriver.phoneNumber || '',
        whatsappNumber: editingDriver.whatsappNumber || '',
        licenseNumber: editingDriver.licenseNumber || '',
        licenseExpiry: editingDriver.licenseExpiry ? editingDriver.licenseExpiry.split('T')[0] : '',
        notes: editingDriver.notes || ''
      });
    }
  }, [editingDriver]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.ownerNic || !formData.fullName || !formData.phoneNumber) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const url = editingDriver 
        ? `/api/drivers/${editingDriver._id}` 
        : '/api/drivers/create';
      
      const method = editingDriver ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        setFormData({
          ownerNic: '',
          fullName: '',
          phoneNumber: '',
          whatsappNumber: '',
          licenseNumber: '',
          licenseExpiry: '',
          notes: ''
        });
        
        if (editingDriver) {
          onDriverUpdated();
        } else {
          onDriverCreated();
        }
      } else {
        toast.error(data.message || 'Failed to save driver');
      }
    } catch (error) {
      console.error('Save driver error:', error);
      toast.error('Failed to save driver');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="flex-shrink-0 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          {editingDriver ? 'Edit Driver' : 'Add New Driver'}
        </h2>
      </div>

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto py-4 min-h-0 -mx-1 px-1">
        <div className="space-y-4">
          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Owner NIC */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Owner <span className="text-red-500">*</span>
              </label>
              <select
                name="ownerNic"
                value={formData.ownerNic}
                onChange={handleChange}
                disabled={!!editingDriver}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 disabled:bg-gray-50"
              >
                <option value="">Select Owner</option>
                {owners && owners.map(owner => (
                  <option key={owner._id} value={owner.nicNumber}>
                    {owner.fullName} ({owner.nicNumber})
                  </option>
                ))}
              </select>
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
                placeholder="Driver's full name"
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

            {/* License Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Number
              </label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-400"
                placeholder="DL-123456"
              />
            </div>

            {/* License Expiry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Expiry
              </label>
              <input
                type="date"
                name="licenseExpiry"
                value={formData.licenseExpiry}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
              />
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
          {editingDriver && (
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
            {loading ? 'Saving...' : editingDriver ? 'Update Driver' : 'Add Driver'}
          </button>
        </div>
      </div>
    </form>
  );
}