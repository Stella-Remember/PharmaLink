// src/pages/OwnerDashboard/ClaimsManagement.tsx
import React, { useState, useEffect } from 'react';
import { INSURANCE_PROVIDERS } from '../../utils/insuranceCoverage';

interface Claim {
  id: string;
  claimNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED';
  amount: number;
  createdAt: string;
  notes?: string;
  description?: string;
  user: { firstName: string; lastName: string; };
  inventory?: { medicine?: { name: string; } };
}

interface ParsedClaim extends Claim {
  parsed: {
    invoiceNumber?: string;
    patientName?: string;
    patientId?: string;
    insuranceProvider?: string;
    providerId?: string;
    planCode?: string;
    planName?: string;
    policyNumber?: string;
    diagnosis?: string;
    doctorName?: string;
    employerName?: string;
    employerCategory?: string;
    ubudeheCategory?: string;
    beneficiaryRelationship?: string;
    dateOfBirth?: string;
    gender?: string;
    coveredAmount?: number;
    saleTotal?: number;
    patientOwes?: number;
    coveragePercent?: number;
    paymentLines?: Array<{ method: string; amount: number }>;
    createdAt?: string;
  };
}

const API = 'http://localhost:3001/api';
const token = () => localStorage.getItem('token');

const STATUS_STYLES: Record<string, string> = {
  PENDING:   'bg-amber-100 text-amber-700',
  APPROVED:  'bg-green-100 text-green-700',
  REJECTED:  'bg-red-100 text-red-700',
  PROCESSED: 'bg-blue-100 text-blue-700',
};

// ── Icons ─────────────────────────────────────────────────────────────────────
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const PrintIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
);

const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);

// ── Field helper ──────────────────────────────────────────────────────────────
const Field: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
  <div>
    <div className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</div>
    <div className={`text-sm font-medium ${value ? 'text-gray-800' : 'text-gray-300 italic'}`}>
      {value || '—'}
    </div>
  </div>
);

// ── Claim Detail Modal ────────────────────────────────────────────────────────
const ClaimDetailModal: React.FC<{
  claim: ParsedClaim | null;
  onClose: () => void;
  onStatusUpdate: (id: string, status: string) => void;
}> = ({ claim, onClose, onStatusUpdate }) => {
  const [updating, setUpdating] = useState(false);

  if (!claim) return null;

  const p = claim.parsed;
  const providerId = p.providerId || '';
  const providerInfo = INSURANCE_PROVIDERS.find(pr => pr.id === providerId);

  const handleStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`${API}/claims/${claim.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) { onStatusUpdate(claim.id, newStatus); onClose(); }
    } catch (e) { console.error(e); }
    finally { setUpdating(false); }
  };

  const printClaim = () => {
    const win = window.open('', '_blank', 'width=800,height=1000');
    if (!win) return;
    const pharmacy = JSON.parse(localStorage.getItem('pharmacy') || '{}');
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Claim ${claim.claimNumber}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,sans-serif;font-size:12px;padding:20px;color:#000}
.header{display:flex;justify-content:space-between;align-items:start;margin-bottom:20px;padding-bottom:15px;border-bottom:2px solid #1a2235}
.title{font-size:20px;font-weight:700;color:#1a2235}
.section{margin-bottom:14px;padding:12px;border:1px solid #e5e7eb;border-radius:6px}
.section-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:8px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.field label{font-size:10px;color:#9ca3af;text-transform:uppercase;display:block}
.field span{font-size:12px;font-weight:600}
.coverage{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;text-align:center;padding:10px;background:#f9fafb;border-radius:6px}
.cov-val{font-size:16px;font-weight:700}
.badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600}
.pending{background:#fef3c7;color:#92400e}.approved{background:#d1fae5;color:#065f46}
.rejected{background:#fee2e2;color:#991b1b}.processed{background:#dbeafe;color:#1e40af}
table{width:100%;border-collapse:collapse}
th{background:#f3f4f6;text-align:left;padding:6px;font-size:10px;text-transform:uppercase}
td{padding:6px;border-bottom:1px solid #f3f4f6;font-size:11px}
.footer{margin-top:30px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;text-align:center}
.sig-box{border-top:1px solid #000;padding-top:6px;font-size:10px;color:#6b7280}
</style>
</head><body>
<div class="header">
  <div>
    <div class="title">${pharmacy.name || 'PharmaLink Pharmacy'}</div>
    <div style="font-size:11px;color:#6b7280">${pharmacy.address || ''} ${pharmacy.phone ? '• ' + pharmacy.phone : ''}</div>
    <div style="font-size:11px;color:#6b7280">License: ${pharmacy.licenseNumber || 'N/A'}</div>
  </div>
  <div style="text-align:right">
    <div style="font-size:10px;color:#6b7280;text-transform:uppercase;font-weight:700">Insurance Claim</div>
    <div style="font-size:14px;font-weight:700;color:#1a2235">${claim.claimNumber}</div>
    <div style="font-size:11px;margin-top:4px">${new Date(claim.createdAt).toLocaleDateString('en-RW', { year:'numeric',month:'long',day:'numeric' })}</div>
    <div style="margin-top:4px"><span class="badge ${claim.status.toLowerCase()}">${claim.status}</span></div>
  </div>
</div>
<div class="section">
  <div class="section-title">Insurance Provider</div>
  <div style="display:flex;justify-content:space-between">
    <div><div style="font-size:15px;font-weight:700">${p.insuranceProvider || 'N/A'}</div>${p.planName ? `<div style="font-size:11px;color:#6b7280">${p.planName}</div>` : ''}</div>
    <div style="text-align:right"><div style="font-size:10px;color:#6b7280">Policy Number</div><div style="font-size:13px;font-weight:700">${p.policyNumber || 'N/A'}</div></div>
  </div>
</div>
<div class="section">
  <div class="section-title">Financial Summary</div>
  <div class="coverage">
    <div><div style="font-size:10px;color:#6b7280">Total Bill</div><div class="cov-val">${(p.saleTotal || claim.amount || 0).toLocaleString()}</div><div style="font-size:10px;color:#6b7280">RWF</div></div>
    <div style="border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb"><div style="font-size:10px;color:#6b7280">Insurance (${p.coveragePercent || '—'}%)</div><div class="cov-val" style="color:#065f46">${(p.coveredAmount || 0).toLocaleString()}</div><div style="font-size:10px;color:#6b7280">RWF</div></div>
    <div><div style="font-size:10px;color:#6b7280">Patient Co-pay</div><div class="cov-val" style="color:#991b1b">${(p.patientOwes || 0).toLocaleString()}</div><div style="font-size:10px;color:#6b7280">RWF</div></div>
  </div>
</div>
<div class="section">
  <div class="section-title">Patient Information</div>
  <div class="grid">
    <div class="field"><label>Full Name</label><span>${p.patientName || 'N/A'}</span></div>
    <div class="field"><label>National ID</label><span>${p.patientId || 'N/A'}</span></div>
    <div class="field"><label>Gender</label><span>${p.gender || 'N/A'}</span></div>
    <div class="field"><label>Date of Birth</label><span>${p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : 'N/A'}</span></div>
    <div class="field"><label>Relationship</label><span>${p.beneficiaryRelationship || 'Self'}</span></div>
    ${p.employerName ? `<div class="field"><label>Employer</label><span>${p.employerName}</span></div>` : ''}
  </div>
</div>
<div class="section">
  <div class="section-title">Medical Details</div>
  <div class="grid">
    <div class="field"><label>Prescribing Doctor</label><span>${p.doctorName || 'N/A'}</span></div>
    <div class="field"><label>Diagnosis</label><span>${p.diagnosis || 'N/A'}</span></div>
    <div class="field"><label>Invoice Reference</label><span>${p.invoiceNumber || 'N/A'}</span></div>
    <div class="field"><label>Filed By</label><span>${claim.user.firstName} ${claim.user.lastName}</span></div>
  </div>
</div>
${providerInfo ? `<div class="section" style="background:#fffbeb;border-color:#fcd34d">
  <div class="section-title" style="color:#92400e">Submission Requirements — ${providerInfo.shortName}</div>
  <ul style="list-style:disc;padding-left:16px;font-size:11px;color:#78350f">
    ${providerInfo.claimRequirements.map((r: string) => `<li style="margin:2px 0">${r}</li>`).join('')}
  </ul>
</div>` : ''}
<div class="footer">
  <div><div class="sig-box">Pharmacist Signature & Stamp</div></div>
  <div><div class="sig-box">Insurance Approval</div></div>
  <div><div class="sig-box">Patient / Guardian Signature</div></div>
</div>
<div style="text-align:center;font-size:10px;color:#9ca3af;margin-top:20px">Generated by PharmaLink · ${new Date().toLocaleString()}</div>
</body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl my-4 overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start">
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Insurance Claim</div>
            <div className="text-xl font-semibold text-gray-800">{claim.claimNumber}</div>
            <div className="text-sm text-gray-400 mt-0.5">
              {new Date(claim.createdAt).toLocaleDateString('en-RW', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <CloseIcon />
            </button>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_STYLES[claim.status]}`}>
              {claim.status}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto" style={{ maxHeight: '65vh' }}>

          {/* Financial summary */}
          {p.coveragePercent && (
            <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-xl p-4 text-center">
              <div>
                <div className="text-xs text-gray-400 mb-1">Total Bill</div>
                <div className="text-lg font-semibold text-gray-800">{(p.saleTotal || claim.amount || 0).toLocaleString()}</div>
                <div className="text-xs text-gray-400">RWF</div>
              </div>
              <div className="border-x border-gray-200">
                <div className="text-xs text-gray-400 mb-1">Insurance ({p.coveragePercent}%)</div>
                <div className="text-lg font-semibold text-teal-600">{(p.coveredAmount || 0).toLocaleString()}</div>
                <div className="text-xs text-gray-400">RWF</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Patient Co-pay</div>
                <div className="text-lg font-semibold text-red-500">{(p.patientOwes || 0).toLocaleString()}</div>
                <div className="text-xs text-gray-400">RWF</div>
              </div>
            </div>
          )}

          {/* Provider */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-3">Insurance Provider</div>
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold text-gray-800">{p.insuranceProvider || '—'}</div>
                {p.planName && <div className="text-sm text-gray-400">{p.planName}</div>}
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Policy number</div>
                <div className="font-medium text-gray-800">{p.policyNumber || <span className="text-red-400 text-sm">Missing</span>}</div>
              </div>
            </div>
          </div>

          {/* Patient */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-3">Patient</div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full name" value={p.patientName} />
              <Field label="National ID" value={p.patientId} />
              <Field label="Gender" value={p.gender} />
              <Field label="Date of birth" value={p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : null} />
              <Field label="Relationship" value={p.beneficiaryRelationship || 'Self'} />
              {p.ubudeheCategory && <Field label="Ubudehe category" value={`Category ${p.ubudeheCategory}`} />}
              {p.employerName && <Field label="Employer" value={p.employerName} />}
            </div>
          </div>

          {/* Medical */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-3">Medical details</div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Prescribing doctor" value={p.doctorName} />
              <Field label="Diagnosis" value={p.diagnosis} />
              <Field label="Invoice reference" value={p.invoiceNumber} />
              <Field label="Filed by" value={`${claim.user.firstName} ${claim.user.lastName}`} />
            </div>
            {claim.description && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Prescription details</div>
                <div className="text-sm text-gray-600">{claim.description}</div>
              </div>
            )}
          </div>

          {/* Submission requirements */}
          {providerInfo && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
                Submission Requirements — {providerInfo.shortName}
              </div>
              <div className="space-y-1.5">
                {providerInfo.claimRequirements.map((req: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-amber-800">
                    <span className="mt-0.5 text-amber-500">•</span>
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status update */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-3">Update status</div>
            <div className="grid grid-cols-3 gap-2">
              {['APPROVED', 'REJECTED', 'PROCESSED'].map(s => (
                <button key={s} disabled={claim.status === s || updating}
                  onClick={() => handleStatus(s)}
                  className={`py-2.5 rounded-lg text-xs font-medium border transition disabled:opacity-40 ${
                    claim.status === s
                      ? STATUS_STYLES[s] + ' border-transparent cursor-default'
                      : 'border-gray-200 text-gray-600 hover:bg-white'
                  }`}>
                  {s === 'APPROVED' ? 'Approve' : s === 'REJECTED' ? 'Reject' : 'Mark Processed'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
            Close
          </button>
          <button onClick={printClaim}
            className="flex-[2] py-2.5 bg-[#1a2235] text-white rounded-xl font-medium text-sm hover:bg-[#2a3245] transition flex items-center justify-center gap-2">
            <PrintIcon /> Print Claim Form
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Claims Page ──────────────────────────────────────────────────────────
const ClaimsManagement: React.FC = () => {
  const [claims, setClaims] = useState<ParsedClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ParsedClaim | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/claims`, { headers: { Authorization: `Bearer ${token()}` } });
      const data = await res.json();
      const parsed: ParsedClaim[] = (Array.isArray(data) ? data : []).map((c: Claim) => {
        let p: ParsedClaim['parsed'] = {};
        if (c.notes) { try { p = JSON.parse(c.notes); } catch {} }
        if (c.description && !p.patientName) {
          const parts = c.description.split('|').map((s: string) => s.trim());
          parts.forEach((part: string) => {
            if (part.startsWith('Patient:')) p.patientName = part.replace('Patient:', '').trim();
            if (part.startsWith('ID:'))      p.patientId    = part.replace('ID:', '').trim();
            if (part.startsWith('Invoice:')) p.invoiceNumber = part.replace('Invoice:', '').trim();
            if (part.startsWith('Diagnosis:')) p.diagnosis  = part.replace('Diagnosis:', '').trim();
          });
        }
        return { ...c, parsed: p };
      });
      setClaims(parsed);
    } catch { console.error('Failed to fetch claims'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchClaims(); }, []);

  const handleStatusUpdate = (id: string, status: string) => {
    setClaims(prev => prev.map(c => c.id === id ? { ...c, status: status as any } : c));
  };

  const filtered = claims.filter(c => {
    const p = c.parsed;
    const matchStatus   = statusFilter === 'all' || c.status === statusFilter;
    const matchProvider = providerFilter === 'all' || p.providerId === providerFilter || (p.insuranceProvider || '').includes(providerFilter);
    const matchSearch   = !search || (p.patientName || '').toLowerCase().includes(search.toLowerCase()) || (p.patientId || '').includes(search) || c.claimNumber.toLowerCase().includes(search.toLowerCase());
    const matchDate     = (!dateFrom || new Date(c.createdAt) >= new Date(dateFrom)) && (!dateTo || new Date(c.createdAt) <= new Date(dateTo + 'T23:59:59'));
    return matchStatus && matchProvider && matchSearch && matchDate;
  });

  const counts = {
    PENDING:   claims.filter(c => c.status === 'PENDING').length,
    APPROVED:  claims.filter(c => c.status === 'APPROVED').length,
    PROCESSED: claims.filter(c => c.status === 'PROCESSED').length,
    REJECTED:  claims.filter(c => c.status === 'REJECTED').length,
  };

  const totalPending  = claims.filter(c => c.status === 'PENDING').reduce((s, c) => s + (c.amount || 0), 0);
  const totalApproved = claims.filter(c => c.status === 'APPROVED' || c.status === 'PROCESSED').reduce((s, c) => s + (c.amount || 0), 0);

  const inputCls = 'px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Insurance Claims</h2>
          <p className="text-sm text-gray-400 mt-0.5">Manage and track all insurance claims</p>
        </div>
        <button onClick={fetchClaims}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
          <RefreshIcon /> Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Pending',   status: 'PENDING',   count: counts.PENDING,   amount: totalPending,  color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Approved',  status: 'APPROVED',  count: counts.APPROVED,  amount: null,           color: 'text-teal-600',  bg: 'bg-teal-50' },
          { label: 'Processed', status: 'PROCESSED', count: counts.PROCESSED, amount: totalApproved,  color: 'text-blue-600',  bg: 'bg-blue-50' },
          { label: 'Rejected',  status: 'REJECTED',  count: counts.REJECTED,  amount: null,           color: 'text-red-500',   bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label}
            onClick={() => setStatusFilter(statusFilter === s.status ? 'all' : s.status)}
            className={`rounded-xl border border-gray-100 p-4 cursor-pointer hover:shadow-sm transition ${
              statusFilter === s.status ? 'ring-2 ring-[#1a2235]' : 'bg-white'
            }`}>
            <div className={`text-2xl font-semibold ${s.color}`}>{s.count}</div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mt-1">{s.label}</div>
            {s.amount != null && <div className={`text-xs font-medium mt-1 ${s.color}`}>{s.amount.toLocaleString()} RWF</div>}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 flex flex-wrap gap-2">
        <input type="text" placeholder="Search patient, ID, claim number..."
          value={search} onChange={e => setSearch(e.target.value)}
          className={`flex-1 min-w-48 ${inputCls}`} />
        <select value={providerFilter} onChange={e => setProviderFilter(e.target.value)} className={inputCls}>
          <option value="all">All Providers</option>
          {INSURANCE_PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.shortName}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={inputCls} />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={inputCls} />
        {(statusFilter !== 'all' || providerFilter !== 'all' || search || dateFrom || dateTo) && (
          <button onClick={() => { setStatusFilter('all'); setProviderFilter('all'); setSearch(''); setDateFrom(''); setDateTo(''); }}
            className="px-3 py-2 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50">
            Clear filters
          </button>
        )}
      </div>

      {/* Claims list */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-sm text-gray-400">Loading claims...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="text-gray-400 text-sm">
            {claims.length === 0 ? 'No claims yet. Claims are created automatically when insurance is used at POS.' : 'No claims match your filters.'}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(claim => {
            const p = claim.parsed;
            const providerId = p.providerId || '';
            const provInfo = INSURANCE_PROVIDERS.find(pr => pr.id === providerId);

            return (
              <div key={claim.id} onClick={() => setSelected(claim)}
                className="bg-white rounded-xl border border-gray-100 p-4 cursor-pointer hover:border-teal-200 hover:shadow-sm transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-sm text-gray-800">{claim.claimNumber}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[claim.status]}`}>{claim.status}</span>
                      {provInfo && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {provInfo.shortName}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-700 font-medium">{p.patientName || 'Patient unknown'}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Filed by {claim.user.firstName} {claim.user.lastName} · {new Date(claim.createdAt).toLocaleDateString('en-RW', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-semibold text-gray-800">{(claim.amount || 0).toLocaleString()}</div>
                    <div className="text-xs text-gray-400">RWF</div>
                    {p.coveragePercent && <div className="text-xs text-teal-600 font-medium mt-0.5">{p.coveragePercent}% covered</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ClaimDetailModal claim={selected} onClose={() => setSelected(null)} onStatusUpdate={handleStatusUpdate} />
    </div>
  );
};

export default ClaimsManagement;