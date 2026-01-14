// FILE 2: src/components/forms/VehicleForm.js

'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import OwnerSearchStep from './OwnerSearchStep';

export default function VehicleForm({ 
  onVehicleCreated, 
  onVehicleUpdated, 
  editingVehicle, 
  onCancelEdit 
}) {
  // Steps: 1=search owner, 2=vehicle type, 3=vehicle number, 4=driver, 5=review
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedOwnerFromDB, setSelectedOwnerFromDB] = useState(null);
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [capacity, setCapacity] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [vehicleTypes] = useState(['Car', 'Van', 'SUV', 'Bus', 'Other']);

  const [showCreateOwner, setShowCreateOwner] = useState(false);

  // Get full owner details from database
  useEffect(() => {
    if (selectedOwner?.nicNumber) {
      fetchOwnerDetails();
    }
  }, [selectedOwner]);

  // Get drivers for owner
  useEffect(() => {
    if (selectedOwner?.nicNumber) {
      fetchDrivers();
    }
  }, [selectedOwner]);

  const fetchOwnerDetails = async () => {
    try {
      const res = await fetch(
        `/api/company-owners/list?ownerNic=${selectedOwner.nicNumber}`
      );
      const data = await res.json();
      
      if (data.success && data.data.length > 0) {
        setSelectedOwnerFromDB(data.data[0]);
      }
    } catch (error) {
      console.error('Fetch owner error:', error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await fetch(
        `/api/drivers/by-owner?ownerNic=${selectedOwner.nicNumber}`
      );
      const data = await res.json();
      
      if (data.success) {
        setDrivers(data.data);
      }
    } catch (error) {
      console.error('Fetch drivers error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedOwner?.nicNumber || !vehicleType || !vehicleNumber || !capacity) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/vehicles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerNic: selectedOwner.nicNumber,
          vehicleNumber: vehicleNumber.toUpperCase(),
          vehicleType,
          capacity: parseInt(capacity),
          driverNic: selectedDriver || null
        })
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Vehicle created successfully!');
        // Reset form
        setStep(1);
        setSelectedOwner(null);
        setSelectedOwnerFromDB(null);
        setVehicleType('');
        setVehicleNumber('');
        setCapacity('');
        setSelectedDriver('');
        onVehicleCreated();
      } else {
        toast.error(data.message || 'Failed to create vehicle');
      }
    } catch (error) {
      console.error('Create vehicle error:', error);
      toast.error('Failed to create vehicle');
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep = () => {
    switch (step) {
      case 1:
        return !!selectedOwner?.nicNumber;
      case 2:
        return !!vehicleType;
      case 3:
        return !!vehicleNumber && !!capacity;
      default:
        return true;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="flex-shrink-0 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Add New Vehicle</h2>
        <p className="text-sm text-gray-500 mt-1">Step {step} of 5</p>
      </div>

      {/* Progress Bar */}
      <div className="flex-shrink-0 px-0 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex justify-between px-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 mx-1 rounded-full transition-colors ${
                s <= step ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto py-4 px-4 min-h-0">
        {/* STEP 1: Search Owner */}
        {step === 1 && !showCreateOwner && (
          <OwnerSearchStep
            onOwnerSelected={setSelectedOwner}
            onCreateNew={() => setShowCreateOwner(true)}
          />
        )}

        {/* STEP 1B: Create New Owner */}
        {step === 1 && showCreateOwner && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Create New Owner</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter owner details. This owner will be available system-wide.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIC Number *</label>
                <input type="text" placeholder="e.g., 12345-6789" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input type="text" placeholder="Owner's full name" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input type="tel" placeholder="+94771234567" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <button
                type="button"
                onClick={() => toast.info('Owner creation form coming in next update')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Create Owner & Continue
              </button>
              <button
                type="button"
                onClick={() => setShowCreateOwner(false)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Back to Search
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Vehicle Type */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Step 2: Select Vehicle Type</h3>
              <p className="text-sm text-gray-600 mb-4">
                Owner: {selectedOwner?.fullName} ({selectedOwner?.nicNumber})
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {vehicleTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setVehicleType(type)}
                  className={`p-4 rounded-lg border-2 font-medium transition-all ${
                    vehicleType === type
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Vehicle Number & Capacity */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Step 3: Vehicle Details</h3>
              <p className="text-sm text-gray-600 mb-4">
                Type: {vehicleType} | Owner: {selectedOwner?.fullName}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Number *
              </label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                placeholder="e.g., CAR-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity (Passengers) *
              </label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                min="1"
                placeholder="e.g., 4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Driver Assignment (Optional) */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Step 4: Assign Driver (Optional)</h3>
              <p className="text-sm text-gray-600 mb-4">
                Vehicle: {vehicleNumber} | Capacity: {capacity}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Driver
              </label>
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
              >
                <option value="">No Driver (Unassigned)</option>
                {drivers.map((driver) => (
                  <option key={driver._id} value={driver._id}>
                    {driver.fullName} - {driver.phoneNumber}
                  </option>
                ))}
              </select>
            </div>

            {drivers.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  💡 No drivers created yet. You can assign a driver later or create new drivers.
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Review */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 5: Review & Create</h3>

            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-600">Owner:</span>
                <span className="font-medium text-gray-900">{selectedOwner?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">NIC:</span>
                <span className="font-medium text-gray-900">{selectedOwner?.nicNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium text-gray-900">{selectedOwner?.phoneNumber}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehicle Number:</span>
                  <span className="font-medium text-gray-900">{vehicleNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium text-gray-900">{vehicleType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Capacity:</span>
                  <span className="font-medium text-gray-900">{capacity} passengers</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Driver:</span>
                  <span className="font-medium text-gray-900">
                    {selectedDriver
                      ? drivers.find((d) => d._id === selectedDriver)?.fullName
                      : 'Unassigned'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                ✓ All details are correct. Click "Create Vehicle" to proceed.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Navigation Buttons */}
      <div className="flex-shrink-0 pt-4 border-t border-gray-200 flex justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1 || loading}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
        >
          <ChevronLeft size={18} />
          Back
        </button>

        {step < 5 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            disabled={!canProceedStep() || loading}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            Next
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating...' : 'Create Vehicle'}
          </button>
        )}
      </div>
    </form>
  );
}