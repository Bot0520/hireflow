// File: src/components/tables/DriversTable.js
// Drivers List Table

'use client';
import { Edit, Trash2, Phone } from 'lucide-react';

export default function DriversTable({ drivers, loading, onEditDriver, onDeleteDriver }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading drivers...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {drivers.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No drivers found. Create one to get started!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">License</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {drivers.map((driver) => (
                <tr key={driver._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {driver.ownerNic}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {driver.fullName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <a href={`tel:${driver.phoneNumber}`} className="flex items-center space-x-1 text-blue-600 hover:underline">
                      <Phone size={16} />
                      <span>{driver.phoneNumber}</span>
                    </a>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {driver.licenseNumber || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {driver.licenseExpiry ? new Date(driver.licenseExpiry).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      driver.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => onEditDriver(driver)}
                      className="text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors"
                      title="Edit driver"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => onDeleteDriver(driver._id)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                      title="Delete driver"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}