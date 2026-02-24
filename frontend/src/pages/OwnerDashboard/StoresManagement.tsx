import React, { useState } from 'react';
import { 
  BuildingStorefrontIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface Store {
  id: string;
  name: string;
  location: string;
  totalMedicines: number;
  lowStock: number;
  todaySales: number;
  employees: number;
  status: 'active' | 'inactive';
}

interface Props {
  stores: Store[];
}

const StoresManagement: React.FC<Props> = ({ stores }) => {
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Stores Management</h2>
          <p className="text-gray-600">Manage all your pharmacy locations</p>
        </div>
        <button
          onClick={() => setShowAddStoreModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Store
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
        <input
          type="text"
          placeholder="Search stores by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Stores Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Store</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Location</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Medicines</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Employees</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Today's Sales</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStores.map(store => (
              <tr key={store.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center">
                    <BuildingStorefrontIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-800">{store.name}</span>
                  </div>
                </td>
                <td className="p-4 text-gray-600">{store.location}</td>
                <td className="p-4">
                  <div className="text-gray-800">{store.totalMedicines}</div>
                  <div className="text-xs text-red-600">{store.lowStock} low stock</div>
                </td>
                <td className="p-4 text-gray-800">{store.employees}</td>
                <td className="p-4 text-green-600 font-medium">{store.todaySales.toLocaleString()} RWF</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    store.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {store.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button className="p-1 hover:bg-blue-50 rounded text-blue-600">
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button className="p-1 hover:bg-yellow-50 rounded text-yellow-600">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button className="p-1 hover:bg-red-50 rounded text-red-600">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Store Modal - This uses showAddStoreModal */}
      {showAddStoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add New Store</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              // Handle form submission here
              setShowAddStoreModal(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Number
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddStoreModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoresManagement;