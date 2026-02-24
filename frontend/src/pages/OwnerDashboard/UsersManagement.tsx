// src/pages/OwnerDashboard/UsersManagement.tsx
import React, { useState } from 'react';
import {
  PlusIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Pharmacist' | 'Helper' | 'Manager';
  store: string;
  status: 'active' | 'inactive';
  joinedDate: string;
  phone: string;
}

interface Props {
  stores: Array<{ id: string; name: string }>;
}

const UsersManagement: React.FC<Props> = ({ stores }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Mock users data
  const users: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@medcare.com',
      role: 'Pharmacist',
      store: 'MedCare Pharmacy Downtown',
      status: 'active',
      joinedDate: '2023-01-15',
      phone: '+250 788 123 456'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@healthfirst.com',
      role: 'Manager',
      store: 'HealthFirst Pharmacy West',
      status: 'active',
      joinedDate: '2023-03-20',
      phone: '+250 788 789 012'
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role.toLowerCase() === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Users Management</h2>
          <p className="text-gray-600">Manage staff across all pharmacy locations</p>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="pharmacist">Pharmacist</option>
            <option value="helper">Helper</option>
            <option value="manager">Manager</option>
          </select>
          <select className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="all">All Stores</option>
            {stores.map(store => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(user => (
          <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold text-gray-800">{user.name}</h4>
                  <p className="text-sm text-gray-500">{user.role}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {user.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                {user.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                {user.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <BuildingStorefrontIcon className="h-4 w-4 mr-2 text-gray-400" />
                {user.store}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
              <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition">
                Edit
              </button>
              <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition">
                Disable
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersManagement;