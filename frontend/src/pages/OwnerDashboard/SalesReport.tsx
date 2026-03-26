// src/pages/OwnerDashboard/SalesReport.tsx
import React, { useState, useEffect } from 'react';
import { salesAPI } from '../../api/sales';

interface Pharmacist { id: string; name: string; email: string; }
interface SummaryData {
  totalSales: number; totalRevenue: number;
  totalClaimsAmount: number; pendingClaimsCount: number; averageSale: number;
}
interface PharmacistStat { name: string; sales: number; revenue: number; claims: number; }
interface SaleRow { id: string; invoiceNumber: string; total: number; createdAt: string; user: { firstName: string; lastName: string }; items: any[]; }
interface ClaimRow { id: string; claimNumber: string; amount: number; status: string; createdAt: string; user: { firstName: string; lastName: string }; notes?: string; }

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  PENDING:   { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
  APPROVED:  { bg: '#F0FDF4', color: '#16A34A', border: '#86EFAC' },
  REJECTED:  { bg: '#FEF2F2', color: '#DC2626', border: '#FCA5A5' },
  PROCESSED: { bg: '#EFF6FF', color: '#2563EB', border: '#93C5FD' },
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
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (selectedPharmacist) params.set('pharmacistId', selectedPharmacist);
      const res = await salesAPI.getReport(params);
      const data = res.data;
      setSummary(data.summary);
      setByPharmacist(data.byPharmacist || []);
      setSales(data.sales || []);
      setClaims(data.claims || []);
      setPharmacists(data.pharmacists || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const exportCSV = () => {
    const rows = [
      ['Invoice', 'Date', 'Pharmacist', 'Items', 'Total (RWF)'],
      ...sales.map(s => [s.invoiceNumber, new Date(s.createdAt).toLocaleDateString(), `${s.user.firstName} ${s.user.lastName}`, s.items.length, s.total])
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

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 8,
    fontSize: 13, color: '#374151', backgroundColor: '#F9FAFB', outline: 'none',
  };

  const thStyle: React.CSSProperties = {
    padding: '10px 16px', textAlign: 'left', fontSize: 10,
    fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase',
    letterSpacing: '0.06em', borderBottom: '1px solid #F1F5F9',
  };

  const tdStyle: React.CSSProperties = {
    padding: '12px 16px', fontSize: 13, color: '#374151',
    borderBottom: '1px solid #F8FAFC',
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#201E50', margin: 0 }}>Sales & Claims Report</h2>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Track revenue and insurance claims by pharmacist</p>
        </div>
        <button onClick={exportCSV} style={{
          padding: '8px 16px', backgroundColor: '#32A287', color: 'white',
          border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #F1F5F9', borderRadius: 12, padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>From</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>To</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Pharmacist</label>
          <select value={selectedPharmacist} onChange={e => setSelectedPharmacist(e.target.value)} style={{ ...inputStyle, minWidth: 160 }}>
            <option value="">All Pharmacists</option>
            {pharmacists.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <button onClick={fetchReport} disabled={loading} style={{
          padding: '8px 20px', backgroundColor: '#201E50', color: 'white',
          border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
        }}>
          {loading ? 'Loading...' : 'Apply Filters'}
        </button>
      </div>

      {summary && (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {[
  { label: 'Total Sales', value: summary.totalSales, color: '#4F7CAC' },
  { label: 'Total Revenue', value: `${summary.totalRevenue.toLocaleString()} RWF`, color: '#32A287' },
  { label: 'Average Sale', value: `${Math.round(summary.averageSale).toLocaleString()} RWF`, color: '#374151' },
  { label: 'Claims Amount', value: `${summary.totalClaimsAmount.toLocaleString()} RWF`, color: '#D97706' },
  { label: 'Pending Claims', value: summary.pendingClaimsCount, color: '#DC2626' },
].map(k => (
  <div key={k.label} style={{
    backgroundColor: '#ffffff',
    border: '1px solid #F1F5F9',
    borderLeft: `4px solid ${k.color}`,
    borderRadius: 12,
    padding: 16
  }}>
    <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>
      {k.label}
    </div>
    <div style={{ fontSize: 22, fontWeight: 700, color: k.color, marginTop: 4 }}>
      {k.value}
    </div>
  </div>
))}
          </div>

          {/* Pharmacist Performance */}
          {byPharmacist.length > 0 && (
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #F1F5F9', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #F8FAFC' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#201E50' }}>Performance by Pharmacist</div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Pharmacist</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Sales</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Revenue</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Claims Filed</th>
                  </tr>
                </thead>
                <tbody>
                  {byPharmacist.map((p, i) => (
                    <tr key={i}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{p.name}</td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>{p.sales}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, color: '#32A287' }}>{p.revenue.toLocaleString()} RWF</td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        {p.claims > 0
                          ? <span style={{ fontSize: 11, fontWeight: 700, color: '#D97706', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', padding: '2px 8px', borderRadius: 20 }}>{p.claims}</span>
                          : <span style={{ color: '#D1D5DB' }}>—</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tabs */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #F1F5F9', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #F1F5F9' }}>
              {(['overview', 'sales', 'claims'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: '12px 20px', fontSize: 13, fontWeight: activeTab === tab ? 600 : 500,
                  color: activeTab === tab ? '#201E50' : '#9CA3AF',
                  background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: activeTab === tab ? '2px solid #201E50' : '2px solid transparent',
                  marginBottom: -1, transition: 'all 0.15s',
                }}>
                  {tab === 'sales' ? `Sales (${sales.length})` : tab === 'claims' ? `Claims (${claims.length})` : 'Overview'}
                </button>
              ))}
            </div>

            {/* Sales table */}
            {activeTab === 'sales' && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Invoice</th>
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>Pharmacist</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Items</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map(s => (
                      <tr key={s.id}>
                        <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 12, color: '#6B7280' }}>{s.invoiceNumber}</td>
                        <td style={{ ...tdStyle, color: '#6B7280' }}>{new Date(s.createdAt).toLocaleString()}</td>
                        <td style={{ ...tdStyle, fontWeight: 500 }}>{s.user.firstName} {s.user.lastName}</td>
                        <td style={{ ...tdStyle, textAlign: 'center', color: '#6B7280' }}>{s.items.length}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: '#201E50' }}>{s.total.toLocaleString()} RWF</td>
                      </tr>
                    ))}
                    {sales.length === 0 && (
                      <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: '#9CA3AF', padding: '40px' }}>No sales in this period</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Claims table */}
            {activeTab === 'claims' && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Claim #</th>
                      <th style={thStyle}>Patient</th>
                      <th style={thStyle}>Provider</th>
                      <th style={thStyle}>Pharmacist</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claims.map(c => {
                      const notes = parseClaimNotes(c.notes);
                      const s = STATUS_COLORS[c.status] || { bg: '#F9FAFB', color: '#6B7280', border: '#E5E7EB' };
                      return (
                        <tr key={c.id}>
                          <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 12, color: '#6B7280' }}>{c.claimNumber}</td>
                          <td style={tdStyle}>
                            <div style={{ fontWeight: 500 }}>{notes?.patientName || '—'}</div>
                            {notes?.patientId && <div style={{ fontSize: 11, color: '#9CA3AF' }}>{notes.patientId}</div>}
                          </td>
                          <td style={{ ...tdStyle, color: '#6B7280', fontSize: 12 }}>{notes?.insuranceProvider || '—'}</td>
                          <td style={tdStyle}>{c.user.firstName} {c.user.lastName}</td>
                          <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: '#201E50' }}>{(c.amount || 0).toLocaleString()} RWF</td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>
                            <span style={{ fontSize: 11, fontWeight: 600, backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: '2px 8px', borderRadius: 20 }}>
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {claims.length === 0 && (
                      <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: '#9CA3AF', padding: '40px' }}>No claims in this period</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'overview' && (
              <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 6 }}>Select Sales or Claims tab to see detailed records</div>
                <div style={{ fontSize: 12, color: '#C4C9D4' }}>Use filters above to narrow by date range or pharmacist</div>
              </div>
            )}
          </div>
        </>
      )}

      {!summary && !loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 13, color: '#9CA3AF' }}>Click "Apply Filters" to generate the report</div>
        </div>
      )}
    </div>
  );
};

export default SalesReport;