// File: src/components/forms/HireForm.js
// UPDATED: Show owner + vehicle (not just driver)

'use client';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { ChevronDown } from 'lucide-react';

export default function HireForm({ onHireCreated }) {
  const [formData, setFormData] = useState({
    passengerName: '',
    pickupLocation: '',
    dropLocation: '',
    dateTime: '',
    numberOfPassengers: '',
    hirePrice: '',
    specialRequirements: '',
    vehicleId: '',
    assignmentType: 'auto'
  });

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDropDropdown, setShowDropDropdown] = useState(false);

  const pickupRef = useRef(null);
  const dropRef = useRef(null);

  const defaultLocations = [
    'Airport', 'City Center', 'Railway Station', 'Beach',
    'Hotel District', 'Shopping Mall', 'Hospital', 'Bus Terminal'
  ];

  useEffect(() => {
    fetchVehicles();
  }, [formData.dateTime]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickupRef.current && !pickupRef.current.contains(event.target)) {
        setShowPickupDropdown(false);
      }
      if (dropRef.current && !dropRef.current.contains(event.target)) {
        setShowDropDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchVehicles = async () => {
    if (!formData.dateTime) return;

    try {
      const res = await fetch(
        `/api/vehicles/list?status=available&hireDateTime=${encodeURIComponent(formData.dateTime)}`
      );
      const data = await res.json();

      if (data.success) {
        setVehicles(data.data);
      }
    } catch (error) {
      console.error('Fetch vehicles error:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationSelect = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setShowPickupDropdown(false);
    setShowDropDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.passengerName || !formData.pickupLocation || !formData.dropLocation ||
      !formData.dateTime || !formData.numberOfPassengers || !formData.hirePrice) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/hires/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          vehicleId: formData.vehicleId || null,
          numberOfPassengers: parseInt(formData.numberOfPassengers),
          hirePrice: parseFloat(formData.hirePrice)
        })
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Hire created successfully!');
        // Reset form
        setFormData({
          passengerName: '',
          pickupLocation: '',
          dropLocation: '',
          dateTime: '',
          numberOfPassengers: '',
          hirePrice: '',
          specialRequirements: '',
          vehicleId: '',
          assignmentType: 'auto'
        });
        onHireCreated();
      } else {
        toast.error(data.message || 'Failed to create hire');
      }
    } catch (error) {
      console.error('Create hire error:', error);
      toast.error('Failed to create hire');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedVehicleInfo = () => {
    if (!formData.vehicleId) return null;
    const vehicle = vehicles.find(v => v._id === formData.vehicleId);
    if (!vehicle) return null;
    return `${vehicle.vehicleNumber} - ${vehicle.denormalized?.ownerName} - ${vehicle.vehicleType} (${vehicle.capacity} passengers)`;
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="flex-shrink-0 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Create New Hire</h2>
        <p className="text-sm text-gray-500 mt-1">Book a vehicle for passenger</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto py-4 min-h-0 -mx-1 px-1">
        <div className="space-y-4">
          {/* Passenger Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passenger Name *
            </label>
            <input
              type="text"
              name="passengerName"
              value={formData.passengerName}
              onChange={handleChange}
              placeholder="Enter passenger name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
            />
          </div>

          {/* Pickup Location */}
          <div className="relative" ref={pickupRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Location *
            </label>
            <div className="relative">
              <input
                type="text"
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleChange}
                placeholder="Select location"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
              />
              <button
                type="button"
                onClick={() => {
                  setShowPickupDropdown(!showPickupDropdown);
                  setShowDropDropdown(false);
                }}
                className="absolute right-0 top-0 h-full px-3 flex items-center border-l border-gray-300 hover:bg-gray-50"
              >
                <ChevronDown size={18} className="text-gray-500" />
              </button>
            </div>

            {showPickupDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {defaultLocations.map(loc => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handleLocationSelect('pickupLocation', loc)}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-900"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Drop Location */}
          <div className="relative" ref={dropRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Drop Location *
            </label>
            <div className="relative">
              <input
                type="text"
                name="dropLocation"
                value={formData.dropLocation}
                onChange={handleChange}
                placeholder="Select location"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
              />
              <button
                type="button"
                onClick={() => {
                  setShowDropDropdown(!showDropDropdown);
                  setShowPickupDropdown(false);
                }}
                className="absolute right-0 top-0 h-full px-3 flex items-center border-l border-gray-300 hover:bg-gray-50"
              >
                <ChevronDown size={18} className="text-gray-500" />
              </button>
            </div>

            {showDropDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {defaultLocations.map(loc => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handleLocationSelect('dropLocation', loc)}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-900"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              name="dateTime"
              value={formData.dateTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
            />
          </div>

          {/* Number of Passengers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Passengers *
            </label>
            <input
              type="number"
              name="numberOfPassengers"
              value={formData.numberOfPassengers}
              onChange={handleChange}
              min="1"
              placeholder="e.g., 4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
            />
          </div>

          {/* Hire Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hire Price (Rs.) *
            </label>
            <input
              type="number"
              name="hirePrice"
              value={formData.hirePrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="e.g., 5000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
            />
          </div>

          {/* Vehicle Selection */}
          {formData.dateTime && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign Vehicle (Optional)
              </label>
              <div className="relative">
                <select
                  name="vehicleId"
                  value={formData.vehicleId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 bg-white appearance-none cursor-pointer"
                >
                  <option value="">Auto-assign (Manager will assign)</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.vehicleNumber} - {vehicle.denormalized?.ownerName} - {vehicle.vehicleType}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
              {getSelectedVehicleInfo() && (
                <p className="text-xs text-green-600 mt-1">✓ {getSelectedVehicleInfo()}</p>
              )}
            </div>
          )}

          {/* Special Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Requirements
            </label>
            <textarea
              name="specialRequirements"
              value={formData.specialRequirements}
              onChange={handleChange}
              rows="3"
              placeholder="Any special requirements..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Fixed Submit Button */}
      <div className="flex-shrink-0 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Creating...' : 'Create Hire'}
        </button>
      </div>
    </form>
  );
}