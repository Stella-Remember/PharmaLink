// src/components/Inventory/InventoryList.tsx
import React, { useState, useEffect, useRef } from 'react';
import { inventoryAPI, Medicine } from '../../api/inventory';
import AddInventory from './AddInventory';
import AdjustStock from './AdjustStock';

const TEMPLATE_HEADERS = [
  'medicineName', 'category', 'manufacturer', 'strength',
  'batchNumber', 'expiryDate', 'quantity', 'reorderLevel', 'unitPrice'
];

const InventoryList: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState<{ show: boolean; medicineId: string | null }>({
    show: false, medicineId: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null, message: '',
  });
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchMedicines(); }, []);

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
    if (!window.confirm('Delete this medicine?')) return;
    try {
      await inventoryAPI.delete(id);
      setMedicines(medicines.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting medicine:', error);
    }
  };

  // ── EXPORT ──────────────────────────────────────────────────────────────────
  const handleExport = () => {
    const rows = [
      TEMPLATE_HEADERS,
      ...medicines.map(m => [
        m.name || m.medicineName || '',
        m.category || '',
        m.manufacturer || '',
        m.strength || '',
        m.batchNumber || '',
        m.expiryDate ? new Date(m.expiryDate).toISOString().split('T')[0] : '',
        m.quantity ?? '',
        m.reorderLevel ?? '',
        m.sellingPrice ?? m.unitPrice ?? '',
      ]),
    ];

    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ── DOWNLOAD TEMPLATE ────────────────────────────────────────────────────────
  const handleDownloadTemplate = () => {
    const sampleRow = [
      'Amoxicillin 500mg', 'Antibiotics', 'Cipla', '500mg',
      'BT-2025-001', '2027-06-30', '200', '50', '1500',
    ];
    const csv = [TEMPLATE_HEADERS, sampleRow]
      .map(r => r.map(c => `"${c}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inventory_import_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // ── IMPORT ───────────────────────────────────────────────────────────────────
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      setImportStatus({ type: 'error', message: 'Please upload a CSV file.' });
      return;
    }

    setImporting(true);
    setImportStatus({ type: null, message: '' });

    const text = await file.text();
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      setImportStatus({ type: 'error', message: 'CSV is empty or has no data rows.' });
      setImporting(false);
      return;
    }

    // Parse header row (strip quotes)
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const requiredHeaders = ['medicineName', 'category', 'batchNumber', 'expiryDate', 'quantity', 'reorderLevel', 'unitPrice'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      setImportStatus({ type: 'error', message: `Missing columns: ${missingHeaders.join(', ')}. Download the template first.` });
      setImporting(false);
      return;
    }

    // Parse data rows
    const rows = lines.slice(1).map(line => {
      // Handle quoted CSV values
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      for (const char of line) {
        if (char === '"') { inQuotes = !inQuotes; }
        else if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
        else { current += char; }
      }
      values.push(current.trim());
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = values[i] || ''; });
      return obj;
    }).filter(row => row.medicineName); // skip empty rows

    if (rows.length === 0) {
      setImportStatus({ type: 'error', message: 'No valid data rows found.' });
      setImporting(false);
      return;
    }

    // Validate and send each row
    const token = localStorage.getItem('token');
    let successCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 because row 1 is header

      // Validate
      if (isNaN(Number(row.quantity)) || Number(row.quantity) < 0) {
        errors.push(`Row ${rowNum}: Invalid quantity "${row.quantity}"`);
        continue;
      }
      if (isNaN(Number(row.unitPrice)) || Number(row.unitPrice) <= 0) {
        errors.push(`Row ${rowNum}: Invalid unitPrice "${row.unitPrice}"`);
        continue;
      }

      const payload = {
        medicineName: row.medicineName,
        genericName: row.medicineName,
        category: row.category || 'Other',
        manufacturer: row.manufacturer || 'Unknown',
        strength: row.strength || 'N/A',
        form: 'Tablet',
        requiresPrescription: false,
        batchNumber: row.batchNumber,
        expiryDate: row.expiryDate,
        quantity: parseInt(row.quantity),
        reorderLevel: parseInt(row.reorderLevel) || 10,
        unitPrice: parseFloat(row.unitPrice),
        sellingPrice: parseFloat(row.unitPrice),
        supplierId: null,
        location: 'Main Store',
      };

      try {
        const response = await fetch('http://localhost:3001/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          successCount++;
        } else {
          const data = await response.json();
          errors.push(`Row ${rowNum} (${row.medicineName}): ${data.error || data.message || 'Failed'}`);
        }
      } catch {
        errors.push(`Row ${rowNum}: Network error`);
      }
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (successCount > 0) {
      fetchMedicines();
      setImportStatus({
        type: errors.length > 0 ? 'error' : 'success',
        message: `✅ ${successCount} medicine(s) imported successfully.${errors.length > 0 ? `\n⚠️ ${errors.length} row(s) failed:\n${errors.slice(0, 5).join('\n')}` : ''}`,
      });
    } else {
      setImportStatus({ type: 'error', message: `Import failed:\n${errors.slice(0, 5).join('\n')}` });
    }

    setImporting(false);
  };

  const filteredMedicines = medicines.filter(med => {
    const name = med.name || med.medicineName || '';
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (med.batchNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || med.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = [...new Set(medicines.map(m => m.category).filter(Boolean))];

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h2 className="text-xl font-bold text-gray-800">
          Inventory
          <span className="ml-2 text-sm font-normal text-gray-500">({medicines.length} items)</span>
        </h2>

        <div className="flex flex-wrap gap-2">
          {/* Import / Export group */}
          <button
            onClick={handleDownloadTemplate}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
            title="Download CSV template"
          >
            📋 Template
          </button>

          <label
            className={`px-3 py-2 text-sm border border-blue-300 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 flex items-center gap-1 cursor-pointer ${importing ? 'opacity-50 pointer-events-none' : ''}`}
            title="Import from CSV"
          >
            {importing ? '⏳ Importing...' : '⬆️ Import CSV'}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          <button
            onClick={handleExport}
            disabled={medicines.length === 0}
            className="px-3 py-2 text-sm border border-green-300 text-green-700 bg-green-50 rounded-lg hover:bg-green-100 flex items-center gap-1 disabled:opacity-40"
            title="Export to CSV"
          >
            ⬇️ Export CSV
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-1"
          >
            + Add Medicine
          </button>
        </div>
      </div>

      {/* Import status */}
      {importStatus.type && (
        <div className={`p-3 rounded-lg text-sm whitespace-pre-line border ${
          importStatus.type === 'success'
            ? 'bg-green-50 text-green-800 border-green-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {importStatus.message}
          <button
            onClick={() => setImportStatus({ type: null, message: '' })}
            className="float-right text-gray-400 hover:text-gray-600 ml-4"
          >✕</button>
        </div>
      )}

      {/* Low stock warning */}
      {medicines.filter(m => m.quantity <= m.reorderLevel).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg text-sm">
          ⚠️ {medicines.filter(m => m.quantity <= m.reorderLevel).length} item(s) are at or below reorder level
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Search by name or batch number..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Loading inventory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Medicine</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Batch</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Expiry</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMedicines.map(medicine => {
                  const daysToExpiry = Math.ceil(
                    (new Date(medicine.expiryDate).getTime() - Date.now()) / 86400000
                  );
                  const isExpiringSoon = daysToExpiry <= 90;
                  const isExpired = daysToExpiry < 0;
                  const isLowStock = medicine.quantity <= medicine.reorderLevel;
                  const displayName = medicine.name || medicine.medicineName || 'N/A';

                  return (
                    <tr key={medicine.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{displayName}</div>
                        {medicine.strength && <div className="text-xs text-gray-400">{medicine.strength}</div>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{medicine.category}</td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{medicine.batchNumber}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          isExpired ? 'bg-red-100 text-red-700' :
                          isExpiringSoon ? 'bg-amber-100 text-amber-700' :
                          'text-gray-600'
                        }`}>
                          {isExpired ? '⛔ ' : isExpiringSoon ? '⚠️ ' : ''}
                          {new Date(medicine.expiryDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${isLowStock ? 'text-red-600' : 'text-gray-800'}`}>
                          {medicine.quantity}
                          {isLowStock && <span className="ml-1 text-xs text-red-500">(low)</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-800 font-medium">
                        {(medicine.sellingPrice || medicine.unitPrice || 0).toLocaleString()} RWF
                      </td>
                      <td className="px-4 py-3 text-right space-x-3">
                        <button
                          onClick={() => setShowAdjustModal({ show: true, medicineId: medicine.id })}
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                        >
                          Adjust
                        </button>
                        <button
                          onClick={() => handleDelete(medicine.id)}
                          className="text-red-500 hover:text-red-700 font-medium text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredMedicines.length === 0 && !isLoading && (
              <div className="p-12 text-center text-gray-400">
                {searchTerm || categoryFilter !== 'all'
                  ? 'No medicines match your search.'
                  : 'No medicines yet. Add one or import from CSV.'}
              </div>
            )}
          </div>
        )}
      </div>

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
          onSuccess={() => { fetchMedicines(); setShowAdjustModal({ show: false, medicineId: null }); }}
          medicineId={showAdjustModal.medicineId}
        />
      )}
    </div>
  );
};

export default InventoryList;