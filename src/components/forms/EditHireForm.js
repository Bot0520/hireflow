// File: src/components/forms/EditHireForm.js
'use client';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { ChevronDown } from 'lucide-react';

export default function EditHireForm({ hire, onHireUpdated, onCancel }) {
  const [formData, setFormData] = useState({
    passengerName: '',
    pickupLocation: '',
    dropLocation: '',
    dateTime: '',
    numberOfPassengers: '',
    hirePrice: '',
    specialRequirements: '',
    vehicleType: '',
    assignmentType: 'auto',
  });

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [originalVehicle, setOriginalVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDropDropdown, setShowDropDropdown] = useState(false);

  const pickupRef = useRef(null);
  const dropRef = useRef(null);

  const defaultLocations = [
    'Airport',
    'City Center',
    'Railway Station',
    'Beach',
    'Hotel District',
    'Shopping Mall',
    'Hospital',
    'Bus Terminal'
  ];

  const vehicleTypes = ['Car', 'Van', 'SUV', 'Bus', 'Other'];

  // Initialize form with hire data
  useEffect(() => {
    if (hire) {
      const dateObj = new Date(hire.dateTime);
      const isoDateTime = dateObj.toISOString().slice(0, 16);
      
      setFormData({
        passengerName: hire.passengerName || '',
        pickupLocation: hire.pickupLocation || '',
        dropLocation: hire.dropLocation || '',
        dateTime: isoDateTime || '',
        numberOfPassengers: hire.numberOfPassengers || '',
        hirePrice: hire.hirePrice || '',
        specialRequirements: hire.specialRequirements || '',
        vehicleType: hire.vehicleType || '',
        assignmentType: hire.assignmentType || 'auto',
      });
      
      // Store original vehicle data
      if (hire.vehicleId) {
        setOriginalVehicle(hire.vehicleId);
        setSelectedVehicle(hire.vehicleId._id || '');
      } else {
        setOriginalVehicle(null);
        setSelectedVehicle('');
      }
    }
  }, [hire]);

  // Fetch vehicles when in manual mode and hire not accepted
  useEffect(() => {
    if (formData.assignmentType === 'manual' && hire?.status !== 'accepted') {
      fetchVehicles();
    }
  }, [formData.vehicleType, formData.dateTime, formData.assignmentType, hire?.status]);

  const fetchVehicles = async () => {
    try {
      let url = '/api/vehicles/list?status=available';
      
      if (formData.vehicleType) {
        url += `&vehicleType=${formData.vehicleType}`;
      }
      
      if (formData.dateTime) {
        url += `&hireDateTime=${encodeURIComponent(formData.dateTime)}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setVehicles(data.data);
      }
    } catch (error) {
      console.error('Fetch vehicles error:', error);
    }
  };

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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleInputFocus = (field) => {
    if (field === 'pickup') {
      setShowPickupDropdown(false);
    } else if (field === 'drop') {
      setShowDropDropdown(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.passengerName || !formData.pickupLocation || !formData.dropLocation || 
        !formData.dateTime || !formData.numberOfPassengers || !formData.hirePrice) {
      toast.error('Please fill all required fields');
      return;
    }

    // Only allow vehicle selection if hire not yet accepted
    if (formData.assignmentType === 'manual' && hire?.status !== 'accepted' && !selectedVehicle) {
      toast.error('Please select a vehicle');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        passengerName: formData.passengerName,
        pickupLocation: formData.pickupLocation,
        dropLocation: formData.dropLocation,
        dateTime: formData.dateTime,
        numberOfPassengers: formData.numberOfPassengers,
        hirePrice: formData.hirePrice,
        specialRequirements: formData.specialRequirements
      };

      // Only allow editing vehicle type and vehicle ID if not accepted
      if (hire?.status !== 'accepted') {
        payload.vehicleType = formData.vehicleType;
        payload.assignmentType = formData.assignmentType;
        if (formData.assignmentType === 'manual') {
          payload.vehicleId = selectedVehicle;
        } else {
          payload.vehicleId = null;
        }
      }

      const res = await fetch(`/api/hires/${hire._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        onHireUpdated();
      } else {
        toast.error(data.message || 'Failed to update hire');
      }
    } catch (error) {
      console.error('Update hire error:', error);
      toast.error('Failed to update hire');
    } finally {
      setLoading(false);
    }
  };

  // Check if hire is already accepted
  const isHireAccepted = hire?.status === 'accepted' || hire?.status === 'in_progress';

  // Get selected vehicle display name
  const getSelectedVehicleName = () => {
    if (selectedVehicle) {
      const vehicle = vehicles.find(v => v._id === selectedVehicle);
      if (vehicle) {
        return `${vehicle.vehicleNumber} - ${vehicle.vehicleType} (${vehicle.driverName})`;
      }
    }
    return '';
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="flex-shrink-0 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Edit Hire #{hire?.hireId}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {isHireAccepted ? 'Limited edit - hire already assigned to driver' : 'Update hire details'}
        </p>
      </div>

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto overflow-x-visible py-4 min-h-0 -mx-1 px-1">
        <div className="space-y-4">
          {/* ASSIGNMENT MODE AT TOP - Only show if not accepted */}
          {!isHireAccepted && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Assignment Mode
              </label>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, assignmentType: 'auto' }))}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    formData.assignmentType === 'auto'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  Auto
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, assignmentType: 'manual' }))}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    formData.assignmentType === 'manual'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  Manual
                </button>
              </div>
            </div>
          )}

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Passenger Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passenger Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="passengerName"
                value={formData.passengerName}
                onChange={handleChange}
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-400"
                placeholder="Enter passenger name"
              />
            </div>

            {/* Pickup Location with Dropdown */}
            <div className="relative" ref={pickupRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={handleChange}
                  onFocus={() => handleInputFocus('pickup')}
                  autoComplete="off"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-400"
                  placeholder="Type or select location"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowPickupDropdown(!showPickupDropdown);
                    setShowDropDropdown(false);
                  }}
                  className="absolute right-0 top-0 h-full px-3 flex items-center justify-center border-l border-gray-300 hover:bg-gray-50 rounded-r-lg transition-colors"
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
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-900 transition-colors"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Drop Location with Dropdown */}
            <div className="relative" ref={dropRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Drop Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="dropLocation"
                  value={formData.dropLocation}
                  onChange={handleChange}
                  onFocus={() => handleInputFocus('drop')}
                  autoComplete="off"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-400"
                  placeholder="Type or select location"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowDropDropdown(!showDropDropdown);
                    setShowPickupDropdown(false);
                  }}
                  className="absolute right-0 top-0 h-full px-3 flex items-center justify-center border-l border-gray-300 hover:bg-gray-50 rounded-r-lg transition-colors"
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
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-900 transition-colors"
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
                Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="dateTime"
                value={formData.dateTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 cursor-pointer"
              />
            </div>

            {/* Number of Passengers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Passengers <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="numberOfPassengers"
                value={formData.numberOfPassengers}
                onChange={handleChange}
                min="1"
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-400"
                placeholder="e.g., 4"
              />
            </div>

            {/* Hire Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hire Price (Rs.) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="hirePrice"
                value={formData.hirePrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-400"
                placeholder="e.g., 5000"
              />
            </div>

            {/* Vehicle Type - Only for AUTO mode and NOT accepted */}
            {!isHireAccepted && formData.assignmentType === 'auto' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Type
                </label>
                <div className="relative">
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 bg-white appearance-none cursor-pointer"
                  >
                    <option value="">Any Type</option>
                    {vehicleTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown size={18} className="text-gray-500" />
                  </div>
                </div>
              </div>
            )}

            {/* MANUAL MODE - Vehicle Type Selection */}
            {!isHireAccepted && formData.assignmentType === 'manual' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Type
                </label>
                <div className="relative">
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 bg-white appearance-none cursor-pointer"
                  >
                    <option value="">All Types</option>
                    {vehicleTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown size={18} className="text-gray-500" />
                  </div>
                </div>
              </div>
            )}

            {/* MANUAL MODE - Vehicle Selection */}
            {!isHireAccepted && formData.assignmentType === 'manual' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Vehicle <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 bg-white appearance-none cursor-pointer"
                  >
                    <option value="">
                      {formData.dateTime 
                        ? vehicles.length > 0 
                          ? 'Choose a vehicle' 
                          : 'No available vehicles at this time'
                        : 'Select date & time first'
                      }
                    </option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle._id} value={vehicle._id}>
                        {vehicle.vehicleNumber} - {vehicle.vehicleType} ({vehicle.driverName})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown size={18} className="text-gray-500" />
                  </div>
                </div>
                {selectedVehicle && getSelectedVehicleName() && (
                  <p className="text-xs text-blue-600 mt-1 font-medium">
                    ✓ Selected: {getSelectedVehicleName()}
                  </p>
                )}
              </div>
            )}
          </div>

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
              autoComplete="off"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-400 resize-none"
              placeholder="Any special requirements..."
            ></textarea>
          </div>
        </div>
      </div>

      {/* Fixed Submit Button */}
      <div className="flex-shrink-0 pt-4 border-t border-gray-200 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Updating...' : 'Update Hire'}
        </button>
      </div>
    </form>
  );
}