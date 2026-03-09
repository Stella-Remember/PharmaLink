// src/pages/OwnerDashboard/PharmacistManagement.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const userAPI = {
  getPharmacists:    ()         => axios.get('/api/users/pharmacists'),
  createPharmacist:  (data: any) => axios.post('/api/users/pharmacists', data),
  deletePharmacist:  (id: string) => axios.delete(`/api/users/pharmacists/${id}`),
};
const pharmacyAPI = { getAll: () => axios.get('/api/pharmacies') };
const staffAPI    = { assign: (data: any) => axios.post('/api/staff/assign', data) };

interface Pharmacist {
  id: string; email: string; firstName: string; lastName: string; phone?: string;
  pharmacies?: { id: string; name: string; role: string; }[];
}
interface Pharmacy { id: string; name: string; location: string; }

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const AddUserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
  </svg>
);
const AssignIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

// ── Input component ───────────────────────────────────────────────────────────
const Input: React.FC<{
  label: string; type?: string; required?: boolean;
  value: string; onChange: (v: string) => void; placeholder?: string;
}> = ({ label, type = 'text', required, value, onChange, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
    <input type={type} required={required} value={value} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 text-gray-800" />
  </div>
);

// ── Modal shell ───────────────────────────────────────────────────────────────
const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><CloseIcon /></button>
      </div>
      {children}
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const PharmacistManagement: React.FC = () => {
  const [pharmacists, setPharmacists] = useState<Pharmacist[]>([]);
  const [pharmacies, setPharmacies]   = useState<Pharmacy[]>([]);
  const [showAdd, setShowAdd]         = useState(false);
  const [showAssign, setShowAssign]   = useState(false);
  const [selected, setSelected]       = useState<Pharmacist | null>(null);
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: '', pharmacyId: '', role: 'PHARMACIST'
  });

  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, phRes] = await Promise.all([userAPI.getPharmacists(), pharmacyAPI.getAll()]);
      setPharmacists(pRes.data);
      setPharmacies(phRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => setForm({ firstName: '', lastName: '', email: '', password: '', phone: '', pharmacyId: '', role: 'PHARMACIST' });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try { await userAPI.createPharmacist(form); setShowAdd(false); resetForm(); fetchData(); }
    catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selected) return; setSubmitting(true);
    try { await staffAPI.assign({ userId: selected.id, pharmacyId: form.pharmacyId, role: form.role }); setShowAssign(false); setSelected(null); fetchData(); }
    catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this pharmacist?')) return;
    try { await userAPI.deletePharmacist(id); fetchData(); }
    catch (e) { console.error(e); }
  };

  const initials = (p: Pharmacist) => `${p.firstName[0]}${p.lastName[0]}`.toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Pharmacist Management</h2>
          <p className="text-sm text-gray-400 mt-0.5">Add and manage pharmacists across your stores</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a2235] text-white rounded-lg font-medium text-sm hover:bg-[#2a3245] transition">
          <AddUserIcon /> Add Pharmacist
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Pharmacists', value: pharmacists.length },
          { label: 'Total Pharmacies',  value: pharmacies.length },
          { label: 'Assigned',          value: pharmacists.filter(p => p.pharmacies?.length).length },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="text-2xl font-semibold text-gray-800">{s.value}</div>
            <div className="text-sm text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h3 className="font-medium text-gray-700 text-sm">Pharmacists</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <div className="text-sm text-gray-400">Loading...</div>
          </div>
        ) : pharmacists.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">
            No pharmacists yet. Click "Add Pharmacist" to get started.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {pharmacists.map(pharmacist => (
              <div key={pharmacist.id} className="p-5 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#1a2235] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {initials(pharmacist)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-gray-800">{pharmacist.firstName} {pharmacist.lastName}</div>
                      <div className="text-sm text-gray-400">{pharmacist.email}</div>
                      {pharmacist.phone && <div className="text-xs text-gray-400 mt-0.5">{pharmacist.phone}</div>}
                      {pharmacist.pharmacies && pharmacist.pharmacies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {pharmacist.pharmacies.map(ph => (
                            <span key={ph.id} className="text-xs px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full font-medium">
                              {ph.name} · {ph.role}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-3">
                    <button onClick={() => { setSelected(pharmacist); setShowAssign(true); }}
                      className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                      title="Assign to pharmacy">
                      <AssignIcon />
                    </button>
                    <button onClick={() => handleDelete(pharmacist.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Remove pharmacist">
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <Modal title="Add New Pharmacist" onClose={() => { setShowAdd(false); resetForm(); }}>
          <form onSubmit={handleAdd} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First name" required value={form.firstName} onChange={set('firstName')} />
              <Input label="Last name"  required value={form.lastName}  onChange={set('lastName')} />
            </div>
            <Input label="Email"    type="email"    required value={form.email}    onChange={set('email')} />
            <Input label="Password" type="password" required value={form.password} onChange={set('password')} />
            <Input label="Phone"    type="tel"               value={form.phone}    onChange={set('phone')} placeholder="+250 7XX XXX XXX" />
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setShowAdd(false); resetForm(); }}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="flex-[2] py-2.5 bg-[#1a2235] text-white rounded-lg text-sm font-medium hover:bg-[#2a3245] transition disabled:opacity-50">
                {submitting ? 'Adding...' : 'Add Pharmacist'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Assign Modal */}
      {showAssign && selected && (
        <Modal title={`Assign ${selected.firstName} ${selected.lastName}`} onClose={() => { setShowAssign(false); setSelected(null); }}>
          <form onSubmit={handleAssign} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Pharmacy<span className="text-red-400 ml-0.5">*</span></label>
              <select required value={form.pharmacyId} onChange={e => set('pharmacyId')(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 text-gray-800">
                <option value="">Select a pharmacy</option>
                {pharmacies.map(p => <option key={p.id} value={p.id}>{p.name} — {p.location}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Role</label>
              <select value={form.role} onChange={e => set('role')(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 text-gray-800">
                <option value="PHARMACIST">Pharmacist</option>
                <option value="MANAGER">Pharmacy Manager</option>
                <option value="HELPER">Helper</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setShowAssign(false); setSelected(null); }}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="flex-[2] py-2.5 bg-[#1a2235] text-white rounded-lg text-sm font-medium hover:bg-[#2a3245] transition disabled:opacity-50">
                {submitting ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default PharmacistManagement;