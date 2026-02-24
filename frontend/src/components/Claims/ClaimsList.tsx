// src/components/Claims/ClaimsList.tsx
import React, { useState, useEffect } from 'react';
import { claimsAPI, Claim } from '../../api/claims';
import CreateClaim from './CreateClaim';

const ClaimsList: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setIsLoading(true);
      const response = await claimsAPI.getAll();
      setClaims(response.data);
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await claimsAPI.updateStatus(id, status);
      fetchClaims();
    } catch (error) {
      console.error('Error updating claim:', error);
    }
  };

  const filteredClaims = claims.filter(claim => {
    if (filter === 'all') return true;
    return claim.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Insurance Claims</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          + New Claim
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Claims</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="p-8 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Claim #</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Insurance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClaims.map((claim) => (
                <tr key={claim.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{claim.claimNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{claim.patientName}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{claim.insuranceProvider}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{claim.amount.toLocaleString()} RWF</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(claim.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(claim.status)}`}>
                      {claim.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {claim.status === 'draft' && (
                      <button
                        onClick={() => handleStatusUpdate(claim.id, 'submitted')}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Submit
                      </button>
                    )}
                    {claim.status === 'submitted' && (
                      <button
                        onClick={() => handleStatusUpdate(claim.id, 'approved')}
                        className="text-sm text-green-600 hover:text-green-800 font-medium"
                      >
                        Approve
                      </button>
                    )}
                    <button className="text-sm text-gray-600 hover:text-gray-800 font-medium">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredClaims.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No claims found. Click "New Claim" to create one.
            </div>
          )}
        </div>
      )}

      {/* Create Claim Modal */}
      {showCreateModal && (
        <CreateClaim
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchClaims();
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

export default ClaimsList;