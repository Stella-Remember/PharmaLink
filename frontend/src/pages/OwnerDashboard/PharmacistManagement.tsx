import React, { useState, useEffect } from 'react';
import { 
  UserPlusIcon, 
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const userAPI = {
  getPharmacists: () => axios.get('/api/users/pharmacists'),
  createPharmacist: (data: any) => axios.post('/api/users/pharmacists', data),
  deletePharmacist: (id: string) => axios.delete(`/api/users/pharmacists/${id}`)
};

const pharmacyAPI = {
  getAll: () => axios.get('/api/pharmacies')
};

const staffAPI = {
  assign: (data: any) => axios.post('/api/staff/assign', data)
};

interface Pharmacist {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  pharmacies?: {
    id: string;
    name: string;
    role: string;
  }[];
}

interface Pharmacy {
  id: string;
  name: string;
  location: string;
}

const PharmacistManagement: React.FC = () => {
  const [pharmacists, setPharmacists] = useState<Pharmacist[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPharmacist, setSelectedPharmacist] = useState<Pharmacist | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    pharmacyId: '',
    role: 'PHARMACIST'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pharmacistsRes, pharmaciesRes] = await Promise.all([
        userAPI.getPharmacists(),
        pharmacyAPI.getAll()
      ]);
      setPharmacists(pharmacistsRes.data);
      setPharmacies(pharmaciesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPharmacist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userAPI.createPharmacist(formData);
      setShowAddModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        pharmacyId: '',
        role: 'PHARMACIST'
      });
      fetchData();
    } catch (error) {
      console.error('Error adding pharmacist:', error);
    }
  };

  const handleAssignToPharmacy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPharmacist) return;
    
    try {
      await staffAPI.assign({
        userId: selectedPharmacist.id,
        pharmacyId: formData.pharmacyId,
        role: formData.role
      });
      setShowAssignModal(false);
      setSelectedPharmacist(null);
      fetchData();
    } catch (error) {
      console.error('Error assigning pharmacist:', error);
    }
  };

  const handleDeletePharmacist = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this pharmacist?')) {
      try {
        await userAPI.deletePharmacist(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting pharmacist:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pharmacist Management</h2>
          <p className="text-gray-500 mt-1">Add and manage pharmacists across your pharmacies</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center"
        >
          <UserPlusIcon className="h-5 w-5 mr-2" />
          Add Pharmacist
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-800">{pharmacists.length}</div>
          <div className="text-sm text-gray-500">Total Pharmacists</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-800">{pharmacies.length}</div>
          <div className="text-sm text-gray-500">Total Pharmacies</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-800">
            {pharmacists.filter(p => p.pharmacies?.length).length}
          </div>
          <div className="text-sm text-gray-500">Assigned Pharmacists</div>
        </div>
      </div>

      {/* Pharmacists List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-800">Pharmacists</h3>
        </div>
        
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {pharmacists.map((pharmacist) => (
              <div key={pharmacist.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {pharmacist.firstName[0]}{pharmacist.lastName[0]}
                        </span>
                      </div>
                      <div className="ml-4">
                        <h4 className="font-semibold text-gray-800">
                          {pharmacist.firstName} {pharmacist.lastName}
                        </h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="flex items-center text-sm text-gray-500">
                            <EnvelopeIcon className="h-4 w-4 mr-1" />
                            {pharmacist.email}
                          </span>
                          {pharmacist.phone && (
                            <span className="flex items-center text-sm text-gray-500">
                              <PhoneIcon className="h-4 w-4 mr-1" />
                              {pharmacist.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Assigned Pharmacies */}
                    {pharmacist.pharmacies && pharmacist.pharmacies.length > 0 && (
                      <div className="mt-4 ml-14">
                        <p className="text-xs text-gray-500 mb-2">Assigned to:</p>
                        <div className="flex flex-wrap gap-2">
                          {pharmacist.pharmacies.map((pharmacy) => (
                            <span
                              key={pharmacy.id}
                              className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                            >
                              <BuildingStorefrontIcon className="h-3 w-3 mr-1" />
                              {pharmacy.name} ({pharmacy.role})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedPharmacist(pharmacist);
                        setShowAssignModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Assign to Pharmacy"
                    >
                      <BuildingStorefrontIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeletePharmacist(pharmacist.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Pharmacist"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {pharmacists.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No pharmacists added yet. Click "Add Pharmacist" to get started.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Pharmacist Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add New Pharmacist</h3>
            <form onSubmit={handleAddPharmacist}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Pharmacist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign to Pharmacy Modal */}
      {showAssignModal && selectedPharmacist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              Assign {selectedPharmacist.firstName} {selectedPharmacist.lastName} to Pharmacy
            </h3>
            <form onSubmit={handleAssignToPharmacy}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Pharmacy
                  </label>
                  <select
                    required
                    value={formData.pharmacyId}
                    onChange={(e) => setFormData({...formData, pharmacyId: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a pharmacy</option>
                    {pharmacies.map((pharmacy) => (
                      <option key={pharmacy.id} value={pharmacy.id}>
                        {pharmacy.name} - {pharmacy.location}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PHARMACIST">Pharmacist</option>
                    <option value="MANAGER">Pharmacy Manager</option>
                    <option value="HELPER">Helper</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedPharmacist(null);
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacistManagement;