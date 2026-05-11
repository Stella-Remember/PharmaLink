// src/components/Inventory/InventoryList.tsx
import React, { useState, useEffect, useRef } from 'react';
import { inventoryAPI, Medicine } from '../../api/inventory';
import AddInventory from './AddInventory';
import AdjustStock from './AdjustStock';
import * as XLSX from 'xlsx';

// Enhanced template headers with all detailed fields
const TEMPLATE_HEADERS = [
  'Medicine Type', 'Trade / Brand Name', 'Generic Name', 'Category',
  'Manufacturer', 'Strength', 'Batch Number', 'Expiry Date',
  'Quantity', 'Reorder Level', 'Price (RWF)'
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

  // ── EXPORT TO EXCEL ─────────────────────────────────────────────────────────
  const handleExportToExcel = () => {
    const exportData = medicines.map(med => ({
      'Medicine Type': med.medicineType === 'PATENTED' ? '® Patented' : 'Generic',
      'Trade / Brand Name': med.medicineName || med.name || '',
      'Generic Name': med.genericName || '',
      'Category': med.category || '',
      'Manufacturer': med.manufacturer || '',
      'Strength': med.strength || '',
      'Batch Number': med.batchNumber || '',
      'Expiry Date': new Date(med.expiryDate).toLocaleDateString(),
      'Quantity': med.quantity,
      'Reorder Level': med.reorderLevel,
      'Price (RWF)': med.unitPrice || med.sellingPrice || 0
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    
    // Auto-size columns
    const colWidths = Object.keys(exportData[0] || {}).map(key => ({
      wch: Math.max(key.length, 20)
    }));
    ws['!cols'] = colWidths;
    
    XLSX.writeFile(wb, `inventory_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // ── EXPORT TO CSV ───────────────────────────────────────────────────────────
  const handleExportToCSV = () => {
    const rows = [
      TEMPLATE_HEADERS,
      ...medicines.map(m => [
        m.medicineType === 'PATENTED' ? '® Patented' : 'Generic',
        m.medicineName || m.name || '',
        m.genericName || '',
        m.category || '',
        m.manufacturer || '',
        m.strength || '',
        m.batchNumber || '',
        m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : '',
        m.quantity ?? '',
        m.reorderLevel ?? '',
        m.unitPrice ?? m.sellingPrice ?? '',
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

  // ── DOWNLOAD EXCEL TEMPLATE ─────────────────────────────────────────────────
  const handleDownloadExcelTemplate = () => {
    const sampleData = [
      {
        'Medicine Type': '® Patented',
        'Trade / Brand Name': 'Nexium',
        'Generic Name': 'Esomeprazole',
        'Category': 'Gastrointestinal',
        'Manufacturer': 'AstraZeneca',
        'Strength': '40mg',
        'Batch Number': 'BT-2025-010',
        'Expiry Date': '06/22/2026',
        'Quantity': 160,
        'Reorder Level': 50,
        'Price (RWF)': 4500
      },
      {
        'Medicine Type': 'Generic',
        'Trade / Brand Name': 'Amoxicillin 500mg',
        'Generic Name': 'Amoxicillin',
        'Category': 'Antibiotics',
        'Manufacturer': 'Cipla',
        'Strength': '500mg',
        'Batch Number': 'BT-2025-001',
        'Expiry Date': '06/30/2027',
        'Quantity': 200,
        'Reorder Level': 50,
        'Price (RWF)': 1500
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    
    // Auto-size columns
    const colWidths = Object.keys(sampleData[0]).map(key => ({
      wch: Math.max(key.length, 20)
    }));
    ws['!cols'] = colWidths;
    
    XLSX.writeFile(wb, 'inventory_import_template.xlsx');
  };

  // ── DOWNLOAD CSV TEMPLATE ───────────────────────────────────────────────────
  const handleDownloadCSVTemplate = () => {
    const sampleRow = [
      '® Patented', 'Nexium', 'Esomeprazole', 'Gastrointestinal',
      'AstraZeneca', '40mg', 'BT-2025-010', '06/22/2026',
      '160', '50', '4500'
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

  // ── IMPORT FROM EXCEL ───────────────────────────────────────────────────────
const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.name.match(/\.(xlsx|xls)$/i)) {
    setImportStatus({ type: 'error', message: 'Please upload an Excel file (.xlsx or .xls).' })
    return
  }
 
  setImporting(true)
  setImportStatus({ type: null, message: '' })
 
  try {
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data)
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(firstSheet) as any[]
 
    if (rows.length === 0) {
      setImportStatus({ type: 'error', message: 'No data found in the Excel file.' })
      return
    }
 
    // Validate template columns before sending
    const requiredFields = ['Trade / Brand Name', 'Category', 'Batch Number', 'Expiry Date', 'Quantity', 'Price (RWF)']
    const firstRow = rows[0] as any
    const missingFields = requiredFields.filter(f => !Object.prototype.hasOwnProperty.call(firstRow, f))
    if (missingFields.length > 0) {
      setImportStatus({
        type: 'error',
        message: `Missing columns: ${missingFields.join(', ')}. Please use the provided template.`
      })
      return
    }
 
    // Map rows to API format — send ALL at once (single HTTP request)
    const items = rows.map((row: any) => ({
      medicineName: row['Trade / Brand Name'] || '',
      medicineType: (row['Medicine Type'] === '® Patented' ? 'PATENTED' : 'GENERIC') as 'PATENTED' | 'GENERIC',
      genericName: row['Generic Name'] || '',
      category: row['Category'] || '',
      manufacturer: row['Manufacturer'] || '',
      strength: row['Strength'] || '',
      batchNumber: String(row['Batch Number'] || ''),
      expiryDate: row['Expiry Date'],   // send raw — backend parseExpiryDate handles all formats
      quantity: Number(row['Quantity']) || 0,
      reorderLevel: Number(row['Reorder Level']) || 10,
      unitPrice: Number(row['Price (RWF)']) || 0
    })) as Partial<Medicine>[]
 
    const response = await inventoryAPI.bulkCreate(items)
    const { successCount, failCount, results } = response.data
 
    const failedRows = results
      .filter((r: any) => !r.success)
      .slice(0, 5)
      .map((r: any) => `Row ${r.row} (${r.name}): ${r.error}`)
 
    setImportStatus({
      type: failCount > 0 && successCount === 0 ? 'error' : 'success',
      message: [
        successCount > 0 ? `✅ ${successCount} medicine(s) imported successfully.` : '',
        failCount > 0 ? `⚠️ ${failCount} row(s) failed:\n${failedRows.join('\n')}` : ''
      ].filter(Boolean).join('\n')
    })
 
    if (successCount > 0) fetchMedicines()
 
  } catch (error: any) {
    const serverError = error.response?.data?.error || 'Failed to read Excel file.'
    setImportStatus({ type: 'error', message: serverError })
  } finally {
    setImporting(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }
}
 
const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.name.endsWith('.csv')) {
    setImportStatus({ type: 'error', message: 'Please upload a CSV file.' })
    return
  }
 
  setImporting(true)
  setImportStatus({ type: null, message: '' })
 
  try {
    const text = await file.text()
    const lines = text.trim().split('\n')
    if (lines.length < 2) {
      setImportStatus({ type: 'error', message: 'CSV is empty or has no data rows.' })
      return
    }
 
    // Parse header
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
    const requiredHeaders = ['Trade / Brand Name', 'Category', 'Batch Number', 'Expiry Date', 'Quantity', 'Price (RWF)']
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
    if (missingHeaders.length > 0) {
      setImportStatus({
        type: 'error',
        message: `Missing columns: ${missingHeaders.join(', ')}. Download the template first.`
      })
      return
    }
 
    // Parse CSV rows (handles quoted commas correctly)
    const parseCSVLine = (line: string): string[] => {
      const values: string[] = []
      let current = ''
      let inQuotes = false
      for (const char of line) {
        if (char === '"') { inQuotes = !inQuotes }
        else if (char === ',' && !inQuotes) { values.push(current.trim()); current = '' }
        else { current += char }
      }
      values.push(current.trim())
      return values
    }
 
    const rows = lines
      .slice(1)
      .map(line => {
        const values = parseCSVLine(line)
        const obj: Record<string, string> = {}
        headers.forEach((h, i) => { obj[h] = values[i] || '' })
        return obj
      })
      .filter(row => row['Trade / Brand Name']?.trim())
 
    if (rows.length === 0) {
      setImportStatus({ type: 'error', message: 'No valid data rows found.' })
      return
    }
 
    // Map and send all at once
    const items = rows.map(row => ({
      medicineName: row['Trade / Brand Name'] || '',
      medicineType: (row['Medicine Type'] === '® Patented' ? 'PATENTED' : 'GENERIC') as 'PATENTED' | 'GENERIC',
      genericName: row['Generic Name'] || '',
      category: row['Category'] || '',
      manufacturer: row['Manufacturer'] || '',
      strength: row['Strength'] || '',
      batchNumber: row['Batch Number'] || '',
      expiryDate: row['Expiry Date'],
      quantity: Number(row['Quantity']) || 0,
      reorderLevel: Number(row['Reorder Level']) || 10,
      unitPrice: Number(row['Price (RWF)']) || 0
    })) as Partial<Medicine>[]
 
    const response = await inventoryAPI.bulkCreate(items)
    const { successCount, failCount, results } = response.data
 
    const failedRows = results
      .filter((r: any) => !r.success)
      .slice(0, 5)
      .map((r: any) => `Row ${r.row} (${r.name}): ${r.error}`)
 
    setImportStatus({
      type: failCount > 0 && successCount === 0 ? 'error' : 'success',
      message: [
        successCount > 0 ? `✅ ${successCount} medicine(s) imported successfully.` : '',
        failCount > 0 ? `⚠️ ${failCount} row(s) failed:\n${failedRows.join('\n')}` : ''
      ].filter(Boolean).join('\n')
    })
 
    if (successCount > 0) fetchMedicines()
 
  } catch (error: any) {
    const serverError = error.response?.data?.error || 'Failed to process CSV file.'
    setImportStatus({ type: 'error', message: serverError })
  } finally {
    setImporting(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }
}

  // ── COMPUTED VALUES ────────────────────────────────────────────────────────
  const uniqueCategories: string[] = Array.from(
    new Set(medicines.map((m: Medicine) => m.category).filter(Boolean))
  ).sort();

  const filteredMedicines: Medicine[] = medicines.filter((medicine: Medicine) => {
    const matchesSearch = (
      medicine.medicineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.genericName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesCategory = categoryFilter === 'all' || medicine.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h2 className="text-xl font-bold text-gray-800">
          Inventory
          <span className="ml-2 text-sm font-normal text-gray-500">({medicines.length} items)</span>
        </h2>

        <div className="flex flex-wrap gap-2">
          {/* Template dropdown */}
          <div className="relative group">
            <button
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
              title="Download template"
            >
              📋 Template
            </button>
            <div className="absolute right-0 mt-1 hidden group-hover:block bg-white border rounded-lg shadow-lg z-10 min-w-40">
              <button
                onClick={handleDownloadExcelTemplate}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg"
              >
                🧾 Excel Template (.xlsx)
              </button>
              <button
                onClick={handleDownloadCSVTemplate}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-b-lg"
              >
                📄 CSV Template (.csv)
              </button>
            </div>
          </div>

          {/* Import dropdown */}
          <div className="relative group">
            <label
              className={`px-3 py-2 text-sm border border-blue-300 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 flex items-center gap-1 cursor-pointer ${importing ? 'opacity-50 pointer-events-none' : ''}`}
              title="Import from file"
            >
              {importing ? '⏳ Importing...' : '⬆️ Import'}
            </label>
            <div className="absolute right-0 mt-1 hidden group-hover:block bg-white border rounded-lg shadow-lg z-10 min-w-40">
              <label className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg cursor-pointer">
                🧾 Import Excel (.xlsx, .xls)
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportExcel}
                  className="hidden"
                />
              </label>
              <label className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-b-lg cursor-pointer">
                📄 Import CSV (.csv)
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Export dropdown */}
          <div className="relative group">
            <button
              disabled={medicines.length === 0}
              className="px-3 py-2 text-sm border border-green-300 text-green-700 bg-green-50 rounded-lg hover:bg-green-100 flex items-center gap-1 disabled:opacity-40"
              title="Export data"
            >
              ⬇️ Export
            </button>
            <div className="absolute right-0 mt-1 hidden group-hover:block bg-white border rounded-lg shadow-lg z-10 min-w-40">
              <button
                onClick={handleExportToExcel}
                disabled={medicines.length === 0}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg disabled:opacity-40"
              >
                🧾 Export to Excel (.xlsx)
              </button>
              <button
                onClick={handleExportToCSV}
                disabled={medicines.length === 0}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-b-lg disabled:opacity-40"
              >
                📄 Export to CSV (.csv)
              </button>
            </div>
          </div>

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
            placeholder="Search by name, generic name, or batch number..."
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
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
                        {medicine.genericName && (
                          <div className="text-xs text-gray-400">{medicine.genericName}</div>
                        )}
                        {medicine.strength && (
                          <div className="text-xs text-gray-400">{medicine.strength}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          medicine.medicineType === 'PATENTED' 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {medicine.medicineType === 'PATENTED' ? '® Patented' : 'Generic'}
                        </span>
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
                  : 'No medicines yet. Add one or import from Excel/CSV.'}
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