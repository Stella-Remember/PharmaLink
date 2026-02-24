// src/components/Claims/CreateClaim.tsx
import React, { useState } from 'react';

interface CreateClaimProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  saleId?: number; // Optional - if creating from a sale
}

const CreateClaim: React.FC<CreateClaimProps> = ({ isOpen, onClose, onSuccess, saleId }) => {
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    insuranceProvider: '',
    policyNumber: '',
    amount: '',
    diagnosis: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  const insuranceProviders = [
    'RSSB - Rwanda Social Security Board',
    'RAMA - Rwanda Military Insurance',
    'MMI - Medical Insurance',
    'CORAR - CORAR Insurance',
    'SORAS - SORAS Insurance',
    'Other'
  ];

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.patientName.trim()) errors.patientName = 'Patient name is required';
    if (!formData.patientId.trim()) errors.patientId = 'Patient ID/National ID is required';
    
    // Validate National ID format (16 digits for Rwanda)
    if (formData.patientId && !/^\d{16}$/.test(formData.patientId.replace(/\s/g, ''))) {
      errors.patientId = 'National ID must be 16 digits';
    }
    
    if (!formData.insuranceProvider) errors.insuranceProvider = 'Insurance provider is required';
    if (!formData.policyNumber.trim()) errors.policyNumber = 'Policy number is required';
    
    // Validate amount
    if (!formData.amount) {
      errors.amount = 'Amount is required';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.amount = 'Please enter a valid amount';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Special handling for amount field
    if (name === 'amount') {
      // Only allow numbers and decimal point
      const cleaned = value.replace(/[^0-9.]/g, '');
      // Prevent multiple decimal points
      const parts = cleaned.split('.');
      if (parts.length > 2) {
        return;
      }
      setFormData({ ...formData, [name]: cleaned });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Clear field error
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  const createClaim = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    const claimData = {
      patientName: formData.patientName,
      patientId: formData.patientId.replace(/\s/g, ''), // Remove spaces
      insuranceProvider: formData.insuranceProvider,
      policyNumber: formData.policyNumber,
      amount: parseFloat(formData.amount),
      diagnosis: formData.diagnosis,
      notes: formData.notes,
      ...(saleId && { saleId }) // Include saleId if provided
    };

    try {
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(claimData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create claim');
      }

      // Success
      onSuccess();
      onClose();

    } catch (err: any) {
      setError(err.message || 'Failed to create claim');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Create Insurance Claim</h2>
        <form onSubmit={createClaim}>
          <div className="space-y-4 max-h-96 overflow-y-auto px-1">
            {/* Patient Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient Name *
              </label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${
                  fieldErrors.patientName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter patient name"
              />
              {fieldErrors.patientName && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.patientName}</p>
              )}
            </div>

            {/* Patient ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient ID/National ID *
              </label>
              <input
                type="text"
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${
                  fieldErrors.patientId ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="16-digit National ID"
                maxLength={16}
              />
              {fieldErrors.patientId && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.patientId}</p>
              )}
            </div>

            {/* Insurance Provider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Insurance Provider *
              </label>
              <select
                name="insuranceProvider"
                value={formData.insuranceProvider}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${
                  fieldErrors.insuranceProvider ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Provider</option>
                {insuranceProviders.map(provider => (
                  <option key={provider} value={provider}>{provider}</option>
                ))}
              </select>
              {fieldErrors.insuranceProvider && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.insuranceProvider}</p>
              )}
            </div>

            {/* Policy Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Policy Number *
              </label>
              <input
                type="text"
                name="policyNumber"
                value={formData.policyNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${
                  fieldErrors.policyNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter policy number"
              />
              {fieldErrors.policyNumber && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.policyNumber}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (RWF) *
              </label>
              <input
                type="text"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${
                  fieldErrors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {fieldErrors.amount && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.amount}</p>
              )}
            </div>

            {/* Diagnosis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagnosis
              </label>
              <input
                type="text"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter diagnosis"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Additional notes..."
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? 'Creating...' : 'Create Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClaim;