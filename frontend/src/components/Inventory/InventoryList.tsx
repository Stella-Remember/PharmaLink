// src/components/Inventory/InventoryList.tsx
import React, { useState, useEffect } from 'react';
import { inventoryAPI, Medicine } from '../../api/inventory';
import AddInventory from './AddInventory';
import AdjustStock from './AdjustStock';

const InventoryList: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState<{ show: boolean; medicineId: string | null }>({
    show: false,
    medicineId: null
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setIsLoading(true);
      const response = await inventoryAPI.getAll();
      setMedicines(response.data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;
    
    try {
      await inventoryAPI.delete(id);
      setMedicines(medicines.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting medicine:', error);
    }
  };

  const handleAdjustSuccess = () => {
    fetchMedicines();
    setShowAdjustModal({ show: false, medicineId: null });
  };

  const filteredMedicines = medicines.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         med.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || med.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Inventory</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Medicine
        </button>
      </div>

      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Categories</option>
            <option value="Analgesics">Analgesics</option>
            <option value="Antibiotics">Antibiotics</option>
            <option value="Antimalarials">Antimalarials</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMedicines.map((medicine) => {
                const daysToExpiry = Math.ceil((new Date(medicine.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const isExpiringSoon = daysToExpiry <= 30;
                const isLowStock = medicine.quantity <= medicine.reorderLevel;

                return (
                  <tr key={medicine.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{medicine.name}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{medicine.batchNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${isExpiringSoon ? 'text-orange-600 font-medium' : 'text-gray-900'}`}>
                        {new Date(medicine.expiryDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${isLowStock ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                        {medicine.quantity} units
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {medicine.sellingPrice.toLocaleString()} RWF
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => setShowAdjustModal({ show: true, medicineId: medicine.id })}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Adjust
                      </button>
                      <button
                        onClick={() => handleDelete(medicine.id)}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredMedicines.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No medicines found. Click "Add Medicine" to add your first item.
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <AddInventory
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchMedicines}
        />
      )}

      {showAdjustModal.show && showAdjustModal.medicineId && (
        <AdjustStock
          isOpen={showAdjustModal.show}
          onClose={() => setShowAdjustModal({ show: false, medicineId: null })}
          onSuccess={handleAdjustSuccess}
          medicineId={showAdjustModal.medicineId}
        />
      )}
    </div>
  );
};

export default InventoryList;