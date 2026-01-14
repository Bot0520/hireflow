// File: src/components/tables/VehiclesTable.js

'use client';
import { useState } from 'react';
import { Edit, Trash2, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VehiclesTable({ vehicles, loading, onEdit, onVehicleUpdated }) {
  const [expandedOwners, setExpandedOwners] = useState(new Set());
  const [deleteModal, setDeleteModal] = useState({ open: false, vehicleId: null, vehicleNumber: null });

  const groupByOwner = (vehicleList) => {
    const grouped = {};
    vehicleList.forEach((vehicle) => {
      if (!grouped[vehicle.denormalized?.ownerName]) {
        grouped[vehicle.denormalized?.ownerName] = {
          ownerName: vehicle.denormalized?.ownerName,
          ownerPhone: vehicle.denormalized?.ownerPhone,
          ownerNic: vehicle.ownerNic,
          vehicles: []
        };
      }
      grouped[vehicle.denormalized?.ownerName].vehicles.push(vehicle);
    });
    return grouped;
  };

  const toggleOwnerExpand = (ownerName) => {
    const newExpanded = new Set(expandedOwners);
    if (newExpanded.has(ownerName)) {
      newExpanded.delete(ownerName);
    } else {
      newExpanded.add(ownerName);
    }
    setExpandedOwners(newExpanded);
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: 'bg-green-100 text-green-800',
      on_hire: 'bg-blue-100 text-blue-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    );
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/vehicles/${deleteModal.vehicleId}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Vehicle deleted successfully');
        setDeleteModal({ open: false, vehicleId: null, vehicleNumber: null });
        onVehicleUpdated();
      } else {
        toast.error(data.message || 'Failed to delete vehicle');
      }
    } catch (error) {
      console.error('Delete vehicle error:', error);
      toast.error('Failed to delete vehicle');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading vehicles...</p>
      </div>
    );
  }

  const groupedVehicles = groupByOwner(vehicles);
  const ownerList = Object.keys(groupedVehicles);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {vehicles.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No vehicles found. Create your first vehicle above.
          </div>
        ) : (
          <div className="space-y-0">
            {ownerList.map((ownerName) => {
              const group = groupedVehicles[ownerName];
              const isExpanded = expandedOwners.has(ownerName);

              return (
                <div key={ownerName} className="border-b border-gray-200 last:border-b-0">
                  {/* Owner Header */}
                  <button
                    onClick={() => toggleOwnerExpand(ownerName)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 text-left">
                      <div>
                        <p className="font-semibold text-gray-900">{ownerName}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>NIC: {group.ownerNic}</span>
                          <a
                            href={`tel:${group.ownerPhone}`}
                            className="flex items-center gap-1 text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Phone size={14} />
                            {group.ownerPhone}
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {group.vehicles.length} vehicle{group.vehicles.length !== 1 ? 's' : ''}
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-gray-600" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-600" />
                      )}
                    </div>
                  </button>

                  {/* Vehicles List */}
                  {isExpanded && (
                    <div className="divide-y divide-gray-200 bg-white">
                      {group.vehicles.map((vehicle) => (
                        <div key={vehicle._id} className="p-4 hover:bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                            <div>
                              <p className="font-medium text-gray-900">{vehicle.vehicleNumber}</p>
                              <p className="text-xs text-gray-500">{vehicle.vehicleType}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-900">{vehicle.denormalized?.driverName || 'Unassigned'}</p>
                              <p className="text-xs text-gray-500">Driver</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-900">{vehicle.capacity} passengers</p>
                              <p className="text-xs text-gray-500">Capacity</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-900">{vehicle.denormalized?.driverPhone || '-'}</p>
                              <p className="text-xs text-gray-500">Contact</p>
                            </div>
                            <div>
                              {getStatusBadge(vehicle.status)}
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => onEdit(vehicle)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteModal({
                                    open: true,
                                    vehicleId: vehicle._id,
                                    vehicleNumber: vehicle.vehicleNumber
                                  })
                                }
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Vehicle?</h3>
            <p className="text-gray-600 mb-2">
              Are you sure you want to delete <strong>{deleteModal.vehicleNumber}</strong>?
            </p>
            <p className="text-sm text-red-600 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, vehicleId: null, vehicleNumber: null })}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}