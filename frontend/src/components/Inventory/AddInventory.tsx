// src/components/Inventory/AddInventory.tsx
import React, { useState } from 'react';

interface AddInventoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddInventory: React.FC<AddInventoryProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    batchNumber: '',
    expiryDate: '',
    quantity: '',
    reorderLevel: '',
    sellingPrice: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  // Validation function
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) errors.name = 'Medicine name is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.batchNumber.trim()) errors.batchNumber = 'Batch number is required';
    if (!formData.expiryDate) errors.expiryDate = 'Expiry date is required';
    
    // Check if expiry date is in the future
    if (formData.expiryDate) {
      const selectedDate = new Date(formData.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.expiryDate = 'Expiry date must be in the future';
      }
    }
    
    // Validate quantity
    if (!formData.quantity) {
      errors.quantity = 'Quantity is required';
    } else {
      const qty = parseInt(formData.quantity);
      if (isNaN(qty) || qty < 0) errors.quantity = 'Quantity must be a positive number';
    }
    
    // Validate reorder level
    if (!formData.reorderLevel) {
      errors.reorderLevel = 'Reorder level is required';
    } else {
      const level = parseInt(formData.reorderLevel);
      if (isNaN(level) || level < 0) errors.reorderLevel = 'Reorder level must be a positive number';
    }
    
    // Validate price (MOST IMPORTANT - this fixes the "334fg" error)
    if (!formData.sellingPrice) {
      errors.sellingPrice = 'Price is required';
    } else {
      // Remove any non-numeric characters except decimal point
      const cleanedPrice = formData.sellingPrice.replace(/[^0-9.]/g, '');
      const price = parseFloat(cleanedPrice);
      if (isNaN(price) || price <= 0) {
        errors.sellingPrice = 'Please enter a valid price (numbers only)';
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for price field - allow numbers and decimal only
    if (name === 'sellingPrice') {
      // Only allow numbers and decimal point
      const cleaned = value.replace(/[^0-9.]/g, '');
      // Prevent multiple decimal points
      const parts = cleaned.split('.');
      if (parts.length > 2) {
        return; // Ignore if multiple decimal points
      }
      setFormData({ ...formData, [name]: cleaned });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form first
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError('');

    // Clean and prepare data for backend
    const inventoryData = {
  medicineName: formData.name,
  genericName: formData.name, // temporary until you add field
  category: formData.category,
  manufacturer: 'Unknown', // temporary required field
  strength: 'N/A',
  form: 'Tablet',
  requiresPrescription: false,

  batchNumber: formData.batchNumber,
  expiryDate: formData.expiryDate,
  quantity: parseInt(formData.quantity),
  reorderLevel: parseInt(formData.reorderLevel),

  unitPrice: parseFloat(formData.sellingPrice),     // required
  sellingPrice: parseFloat(formData.sellingPrice),  // required

  supplierId: null,
  location: 'Main Store'
};

    try {
      const token = localStorage.getItem('token'); 

const response = await fetch('http://localhost:3001/api/inventory', {  
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`   
  },
  body: JSON.stringify(inventoryData)
});
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add inventory');
      }
      
      // Success
      onSuccess();
      onClose();
      
    } catch (err: any) {
      setError(err.message || 'Failed to add inventory item');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Medicine</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Medicine Name */}
            <div>
              <input
                type="text"
                name="name"
                placeholder="Medicine Name *"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${
                  fieldErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {fieldErrors.name && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${
                  fieldErrors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Category *</option>
                <option value="Analgesics">Analgesics</option>
                <option value="Antibiotics">Antibiotics</option>
                <option value="Antimalarials">Antimalarials</option>
              </select>
              {fieldErrors.category && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.category}</p>
              )}
            </div>

            {/* Batch Number */}
            <div>
              <input
                type="text"
                name="batchNumber"
                placeholder="Batch Number *"
                value={formData.batchNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${
                  fieldErrors.batchNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {fieldErrors.batchNumber && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.batchNumber}</p>
              )}
            </div>

            {/* Expiry Date */}
            <div>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]} // Can't select past dates
                className={`w-full px-3 py-2 border rounded-lg ${
                  fieldErrors.expiryDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {fieldErrors.expiryDate && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.expiryDate}</p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <input
                type="text"
                name="quantity"
                placeholder="Quantity *"
                value={formData.quantity}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${
                  fieldErrors.quantity ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {fieldErrors.quantity && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.quantity}</p>
              )}
            </div>

            {/* Reorder Level */}
            <div>
              <input
                type="text"
                name="reorderLevel"
                placeholder="Reorder Level *"
                value={formData.reorderLevel}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${
                  fieldErrors.reorderLevel ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {fieldErrors.reorderLevel && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.reorderLevel}</p>
              )}
            </div>

            {/* Selling Price - WITH VALIDATION */}
            <div>
              <input
                type="text"
                name="sellingPrice"
                placeholder="Selling Price (RWF) *"
                value={formData.sellingPrice}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${
                  fieldErrors.sellingPrice ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {fieldErrors.sellingPrice && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.sellingPrice}</p>
              )}
              <p className="text-gray-400 text-xs mt-1">Numbers only (e.g., 500 or 500.50)</p>
            </div>

            {/* General Error */}
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-2 rounded-lg">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
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
                {isLoading ? 'Adding...' : 'Add Medicine'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInventory;