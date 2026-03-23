// src/components/Inventory/AddInventory.tsx
// KEY FIX: The focus-stealing bug was caused by re-rendering the entire modal
// on every keystroke because parent state changed. This version is self-contained
// and uses local state only — no re-renders from parent during typing.

import React, { useState, useCallback } from 'react';

interface AddInventoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  'Analgesics', 'Antibiotics', 'Antimalarials', 'Antifungals',
  'Antivirals', 'Antiparasitics', 'Cardiovascular', 'Diabetes',
  'Respiratory', 'Gastrointestinal', 'Vitamins & Supplements',
  'Dermatology', 'Ophthalmology', 'Psychiatric', 'Other'
];

const INIT = {
  medicineName: '', genericName: '', medicineType: 'GENERIC', category: '',
  manufacturer: '', strength: '', batchNumber: '', expiryDate: '',
  quantity: '', reorderLevel: '', unitPrice: '',
};

// Use a stable form component that doesn't remount
const AddInventoryForm: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState(INIT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Stable onChange that doesn't cause parent re-renders
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => prev[name] ? { ...prev, [name]: '' } : prev);
  }, []);

  const setType = useCallback((t: string) => setForm(prev => ({ ...prev, medicineType: t })), []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.medicineName.trim()) e.medicineName = 'Required';
    if (!form.category) e.category = 'Required';
    if (!form.batchNumber.trim()) e.batchNumber = 'Required';
    if (!form.expiryDate) e.expiryDate = 'Required';
    if (!form.quantity || isNaN(+form.quantity) || +form.quantity < 0) e.quantity = 'Enter a valid number';
    if (!form.reorderLevel || isNaN(+form.reorderLevel)) e.reorderLevel = 'Enter a valid number';
    if (!form.unitPrice || isNaN(+form.unitPrice) || +form.unitPrice <= 0) e.unitPrice = 'Enter a valid price';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          medicineName: form.medicineName.trim(),
          genericName: form.genericName.trim() || form.medicineName.trim(),
          medicineType: form.medicineType,
          category: form.category,
          manufacturer: form.manufacturer.trim() || 'Unknown',
          strength: form.strength.trim() || 'N/A',
          form: 'Tablet',
          requiresPrescription: form.medicineType === 'PATENTED',
          batchNumber: form.batchNumber.trim(),
          expiryDate: form.expiryDate,
          quantity: parseInt(form.quantity),
          reorderLevel: parseInt(form.reorderLevel) || 10,
          unitPrice: parseFloat(form.unitPrice),
          sellingPrice: parseFloat(form.unitPrice),
          supplierId: null,
          location: 'Main Store',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Failed to add medicine');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Shared input style
  const inp = (name: string) =>
    `w-full px-3 py-2.5 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      fieldErrors[name]
        ? 'border-red-400 bg-red-50 focus:ring-red-400'
        : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400'
    }`;

  return (
    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto" style={{ maxHeight: '78vh' }}>
      <div className="space-y-4">

        {/* Medicine Type */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
            Medicine Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'GENERIC', label: '🧬 Generic', desc: 'Standard, non-branded formula' },
              { value: 'PATENTED', label: '® Patented', desc: 'Brand-name, proprietary' },
            ].map(opt => (
              <button key={opt.value} type="button" onClick={() => setType(opt.value)}
                className={`text-left p-3 rounded-2xl border-2 transition-colors ${
                  form.medicineType === opt.value
                    ? opt.value === 'GENERIC'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}>
                <div className="font-bold text-sm">{opt.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Names */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
              Trade / Brand Name <span className="text-red-500">*</span>
            </label>
            <input
              name="medicineName"
              type="text"
              autoComplete="off"
              placeholder="e.g. Panadol"
              value={form.medicineName}
              onChange={handleChange}
              className={inp('medicineName')}
            />
            {fieldErrors.medicineName && <p className="text-red-500 text-xs mt-1">{fieldErrors.medicineName}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Generic Name</label>
            <input
              name="genericName"
              type="text"
              autoComplete="off"
              placeholder="e.g. Paracetamol"
              value={form.genericName}
              onChange={handleChange}
              className={inp('genericName')}
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select name="category" value={form.category} onChange={handleChange}
            className={inp('category')}>
            <option value="">Select category...</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {fieldErrors.category && <p className="text-red-500 text-xs mt-1">{fieldErrors.category}</p>}
        </div>

        {/* Manufacturer + Strength */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Manufacturer</label>
            <input name="manufacturer" type="text" autoComplete="off" placeholder="e.g. Cipla"
              value={form.manufacturer} onChange={handleChange} className={inp('manufacturer')} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Strength</label>
            <input name="strength" type="text" autoComplete="off" placeholder="e.g. 500mg"
              value={form.strength} onChange={handleChange} className={inp('strength')} />
          </div>
        </div>

        {/* Batch + Expiry */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
              Batch Number <span className="text-red-500">*</span>
            </label>
            <input name="batchNumber" type="text" autoComplete="off" placeholder="BT-2025-001"
              value={form.batchNumber} onChange={handleChange} className={inp('batchNumber')} />
            {fieldErrors.batchNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.batchNumber}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
              Expiry Date <span className="text-red-500">*</span>
            </label>
            <input name="expiryDate" type="date"
              min={new Date().toISOString().split('T')[0]}
              value={form.expiryDate} onChange={handleChange} className={inp('expiryDate')} />
            {fieldErrors.expiryDate && <p className="text-red-500 text-xs mt-1">{fieldErrors.expiryDate}</p>}
          </div>
        </div>

        {/* Qty + Reorder + Price */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: 'quantity', label: 'Quantity', placeholder: '200' },
            { name: 'reorderLevel', label: 'Reorder Level', placeholder: '50' },
            { name: 'unitPrice', label: 'Price (RWF)', placeholder: '1500' },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                {f.label} <span className="text-red-500">*</span>
              </label>
              <input
                name={f.name}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder={f.placeholder}
                value={(form as any)[f.name]}
                onChange={handleChange}
                className={inp(f.name)}
              />
              {fieldErrors[f.name] && <p className="text-red-500 text-xs mt-1">{fieldErrors[f.name]}</p>}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
        <button type="button"
          onClick={() => { onClose(); setError(''); setFieldErrors({}); }}
          className="flex-1 py-3 border-2 border-gray-200 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition">
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="flex-[2] py-3 bg-gray-900 text-white rounded-2xl font-black hover:bg-gray-800 disabled:opacity-50 transition">
          {loading ? '⏳ Adding...' : '+ Add Medicine'}
        </button>
      </div>
    </form>
  );
};

// Modal wrapper — only mounts the form when open, preventing stale state issues
const AddInventory: React.FC<AddInventoryProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden">
        <div className="bg-gray-950 text-white px-6 py-4">
          <h2 className="text-lg font-black">Add New Medicine</h2>
          <p className="text-gray-400 text-xs mt-0.5">Complete the form below to add to inventory</p>
        </div>
        {/* Key re-mounts the form fresh each time modal opens — kills focus bug */}
        <AddInventoryForm key={Date.now()} onClose={onClose} onSuccess={onSuccess} />
      </div>
    </div>
  );
};

export default AddInventory;