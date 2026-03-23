// src/pages/OwnerDashboard/SalesReport.tsx
import React, { useState, useEffect } from 'react';

interface Pharmacist { id: string; name: string; email: string; }
interface SummaryData {
  totalSales: number;
  totalRevenue: number;
  totalClaimsAmount: number;
  pendingClaimsCount: number;
  averageSale: number;
}
interface PharmacistStat { name: string; sales: number; revenue: number; claims: number; }
interface SaleRow { id: string; invoiceNumber: string; total: number; createdAt: string; user: { firstName: string; lastName: string }; items: any[]; }
interface ClaimRow { id: string; claimNumber: string; amount: number; status: string; createdAt: string; user: { firstName: string; lastName: string }; notes?: string; }

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  PROCESSED: 'bg-blue-100 text-blue-700',
};

const SalesReport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [pharmacists, setPharmacists] = useState<Pharmacist[]>([]);
  const [selectedPharmacist, setSelectedPharmacist] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [byPharmacist, setByPharmacist] = useState<PharmacistStat[]>([]);
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'claims'>('overview');

  useEffect(() => { fetchReport(); }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (selectedPharmacist) params.set('pharmacistId', selectedPharmacist);

      const res = await fetch(`http://localhost:3001/api/sales/report?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSummary(data.summary);
      setByPharmacist(data.byPharmacist || []);
      setSales(data.sales || []);
      setClaims(data.claims || []);
      setPharmacists(data.pharmacists || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const rows = [
      ['Invoice', 'Date', 'Pharmacist', 'Items', 'Total (RWF)'],
      ...sales.map(s => [
        s.invoiceNumber,
        new Date(s.createdAt).toLocaleDateString(),
        `${s.user.firstName} ${s.user.lastName}`,
        s.items.length,
        s.total
      ])
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `sales_report_${startDate}_${endDate}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const parseClaimNotes = (notes?: string) => {
    try { return notes ? JSON.parse(notes) : null; } catch { return null; }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Sales & Claims Report</h2>
          <p className="text-gray-400 text-sm mt-0.5">Track what each pharmacist sold and all insurance claims</p>
        </div>
        <button onClick={exportCSV} className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700">
          ⬇️ Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">From</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">To</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Pharmacist</label>
          <select value={selectedPharmacist} onChange={e => setSelectedPharmacist(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm min-w-40">
            <option value="">All Pharmacists</option>
            {pharmacists.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <button onClick={fetchReport} disabled={loading}
          className="px-5 py-2 bg-gray-950 text-white rounded-xl font-bold text-sm hover:bg-gray-800 disabled:opacity-50">
          {loading ? '⏳ Loading...' : '🔍 Apply Filters'}
        </button>
      </div>

      {summary && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Total Sales', value: summary.totalSales, suffix: 'transactions', color: 'bg-blue-50 text-blue-700' },
              { label: 'Total Revenue', value: `${summary.totalRevenue.toLocaleString()} RWF`, suffix: '', color: 'bg-green-50 text-green-700' },
              { label: 'Avg Sale', value: `${Math.round(summary.averageSale).toLocaleString()} RWF`, suffix: '', color: 'bg-purple-50 text-purple-700' },
              { label: 'Claims Amount', value: `${summary.totalClaimsAmount.toLocaleString()} RWF`, suffix: '', color: 'bg-amber-50 text-amber-700' },
              { label: 'Pending Claims', value: summary.pendingClaimsCount, suffix: 'awaiting', color: 'bg-red-50 text-red-700' },
            ].map(k => (
              <div key={k.label} className={`rounded-2xl p-4 ${k.color}`}>
                <div className="text-2xl font-black">{k.value}</div>
                <div className="text-xs font-semibold mt-1 opacity-70 uppercase tracking-wide">{k.label}</div>
                {k.suffix && <div className="text-xs opacity-50">{k.suffix}</div>}
              </div>
            ))}
          </div>

          {/* Per-pharmacist breakdown */}
          {byPharmacist.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-black text-gray-800">Performance by Pharmacist</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-black text-gray-400 uppercase">Pharmacist</th>
                    <th className="px-4 py-2 text-center text-xs font-black text-gray-400 uppercase">Sales</th>
                    <th className="px-4 py-2 text-right text-xs font-black text-gray-400 uppercase">Revenue</th>
                    <th className="px-4 py-2 text-center text-xs font-black text-gray-400 uppercase">Claims Filed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {byPharmacist.map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold text-gray-800">{p.name}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{p.sales}</td>
                      <td className="px-4 py-3 text-right font-black text-gray-900">{p.revenue.toLocaleString()} RWF</td>
                      <td className="px-4 py-3 text-center">
                        {p.claims > 0
                          ? <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-bold">{p.claims}</span>
                          : <span className="text-gray-300">—</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tabs: Sales / Claims */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-100">
              {(['overview', 'sales', 'claims'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-sm font-bold capitalize transition ${
                    activeTab === tab ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-400 hover:text-gray-600'
                  }`}>
                  {tab === 'sales' ? `Sales (${sales.length})` : tab === 'claims' ? `Claims (${claims.length})` : 'Overview'}
                </button>
              ))}
            </div>

            {/* Sales table */}
            {activeTab === 'sales' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-black text-gray-400 uppercase">Invoice</th>
                      <th className="px-4 py-2 text-left text-xs font-black text-gray-400 uppercase">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-black text-gray-400 uppercase">Pharmacist</th>
                      <th className="px-4 py-2 text-center text-xs font-black text-gray-400 uppercase">Items</th>
                      <th className="px-4 py-2 text-right text-xs font-black text-gray-400 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sales.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">{s.invoiceNumber}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{new Date(s.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{s.user.firstName} {s.user.lastName}</td>
                        <td className="px-4 py-3 text-center text-gray-500">{s.items.length}</td>
                        <td className="px-4 py-3 text-right font-black text-gray-900">{s.total.toLocaleString()} RWF</td>
                      </tr>
                    ))}
                    {sales.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-300">No sales in this period</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Claims table */}
            {activeTab === 'claims' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-black text-gray-400 uppercase">Claim #</th>
                      <th className="px-4 py-2 text-left text-xs font-black text-gray-400 uppercase">Patient</th>
                      <th className="px-4 py-2 text-left text-xs font-black text-gray-400 uppercase">Provider</th>
                      <th className="px-4 py-2 text-left text-xs font-black text-gray-400 uppercase">Pharmacist</th>
                      <th className="px-4 py-2 text-right text-xs font-black text-gray-400 uppercase">Amount</th>
                      <th className="px-4 py-2 text-center text-xs font-black text-gray-400 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {claims.map(c => {
                      const notes = parseClaimNotes(c.notes);
                      return (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-xs text-gray-600">{c.claimNumber}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-800">{notes?.patientName || '—'}</div>
                            {notes?.patientId && <div className="text-xs text-gray-400">ID: {notes.patientId}</div>}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{notes?.insuranceProvider || '—'}</td>
                          <td className="px-4 py-3 text-gray-700">{c.user.firstName} {c.user.lastName}</td>
                          <td className="px-4 py-3 text-right font-black text-gray-900">{(c.amount || 0).toLocaleString()} RWF</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-600'}`}>
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {claims.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-300">No claims in this period</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="p-6 text-center text-gray-400">
                <div className="text-4xl mb-2">📊</div>
                <div className="text-sm">Select Sales or Claims tab to see detailed records</div>
                <div className="text-xs mt-1">Use filters above to narrow by date range or pharmacist</div>
              </div>
            )}
          </div>
        </>
      )}

      {!summary && !loading && (
        <div className="text-center py-20 text-gray-300">
          <div className="text-5xl mb-3">📈</div>
          <div className="text-sm">Click "Apply Filters" to generate the report</div>
        </div>
      )}
    </div>
  );
};

export default SalesReport;