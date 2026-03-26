// src/pages/OwnerDashboard/OwnerSettings.tsx
// IMPORTANT: Replace the ENTIRE file with this content.
// This removes all isDark/toggleDark/useTheme references and emojis.
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/client';

const OwnerSettings: React.FC = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: (user as any)?.phone || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);

  const [notif, setNotif] = useState({
    lowStockAlerts: true,
    dailySummary: false,
    claimReminders: true,
    expiryWarnings: true,
  });

  const [currency, setCurrency] = useState('RWF');
  const [taxRate, setTaxRate] = useState('0');
  const [timezone, setTimezone] = useState('Africa/Kigali');

  useEffect(() => {
    const saved = localStorage.getItem('pharmalink-prefs');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.notif) setNotif(p.notif);
        if (p.currency) setCurrency(p.currency);
        if (p.taxRate !== undefined) setTaxRate(String(p.taxRate));
        if (p.timezone) setTimezone(p.timezone);
      } catch {}
    }
  }, []);

  const savePrefs = () => {
    localStorage.setItem('pharmalink-prefs', JSON.stringify({ notif, currency, taxRate, timezone }));
    setProfileMsg('Preferences saved.');
    setTimeout(() => setProfileMsg(''), 3000);
  };

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileMsg('');
    try {
      await api.put('/users/me', profile);
      setProfileMsg('Profile updated successfully.');
    } catch (err: any) {
      setProfileMsg(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
      setTimeout(() => setProfileMsg(''), 4000);
    }
  };

  const handlePwdChange = async () => {
    if (pwd.next !== pwd.confirm) { setPwdMsg('New passwords do not match.'); return; }
    if (pwd.next.length < 6) { setPwdMsg('Password must be at least 6 characters.'); return; }
    setPwdSaving(true);
    setPwdMsg('');
    try {
      await api.post('/users/change-password', { currentPassword: pwd.current, newPassword: pwd.next });
      setPwdMsg('Password changed successfully.');
      setPwd({ current: '', next: '', confirm: '' });
    } catch (err: any) {
      setPwdMsg(err.response?.data?.error || 'Failed to change password.');
    } finally {
      setPwdSaving(false);
      setTimeout(() => setPwdMsg(''), 4000);
    }
  };

  // Shared styles
  const card: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #F1F5F9',
    borderRadius: 12,
    padding: 24,
    marginBottom: 0,
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: '#201E50',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottom: '1px solid #F8FAFC',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 6,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    fontSize: 13,
    color: '#374151',
    backgroundColor: '#F9FAFB',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const btnPrimary: React.CSSProperties = {
    marginTop: 16,
    padding: '8px 20px',
    backgroundColor: '#201E50',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  };

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#201E50', margin: 0 }}>Settings</h2>
        <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Manage your account and preferences</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Profile */}
        <div style={card}>
          <div style={sectionTitle}>Profile Information</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'First Name', key: 'firstName', type: 'text' },
              { label: 'Last Name', key: 'lastName', type: 'text' },
              { label: 'Email Address', key: 'email', type: 'email' },
              { label: 'Phone Number', key: 'phone', type: 'text', placeholder: '+250 7XX XXX XXX' },
            ].map(f => (
              <div key={f.key}>
                <label style={labelStyle}>{f.label}</label>
                <input
                  type={f.type}
                  style={inputStyle}
                  value={(profile as any)[f.key]}
                  placeholder={f.placeholder}
                  onChange={e => setProfile({ ...profile, [f.key]: e.target.value })}
                />
              </div>
            ))}
          </div>
          {profileMsg && (
            <p style={{ marginTop: 10, fontSize: 12, color: profileMsg.includes('success') || profileMsg.includes('saved') ? '#32A287' : '#EF4444' }}>
              {profileMsg}
            </p>
          )}
          <button onClick={handleProfileSave} disabled={profileSaving} style={btnPrimary}>
            {profileSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {/* Change Password */}
        <div style={card}>
          <div style={sectionTitle}>Change Password</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Current Password', key: 'current' },
              { label: 'New Password', key: 'next' },
              { label: 'Confirm New Password', key: 'confirm' },
            ].map(f => (
              <div key={f.key}>
                <label style={labelStyle}>{f.label}</label>
                <input
                  type="password"
                  style={inputStyle}
                  value={(pwd as any)[f.key]}
                  placeholder="••••••••"
                  onChange={e => setPwd({ ...pwd, [f.key]: e.target.value })}
                />
              </div>
            ))}
          </div>
          {pwdMsg && (
            <p style={{ marginTop: 10, fontSize: 12, color: pwdMsg.includes('success') ? '#32A287' : '#EF4444' }}>
              {pwdMsg}
            </p>
          )}
          <button onClick={handlePwdChange} disabled={pwdSaving} style={btnPrimary}>
            {pwdSaving ? 'Updating...' : 'Change Password'}
          </button>
        </div>

        {/* System Preferences */}
        <div style={card}>
          <div style={sectionTitle}>System Preferences</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Currency</label>
              <select style={inputStyle} value={currency} onChange={e => setCurrency(e.target.value)}>
                <option value="RWF">RWF – Rwandan Franc</option>
                <option value="USD">USD – US Dollar</option>
                <option value="EUR">EUR – Euro</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>VAT / Tax Rate (%)</label>
              <input type="number" style={inputStyle} value={taxRate}
                onChange={e => setTaxRate(e.target.value)} min="0" max="100" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Timezone</label>
              <select style={inputStyle} value={timezone} onChange={e => setTimezone(e.target.value)}>
                <option value="Africa/Kigali">Africa/Kigali (UTC+2)</option>
                <option value="Africa/Nairobi">Africa/Nairobi (UTC+3)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
          <button onClick={savePrefs} style={btnPrimary}>Save Preferences</button>
        </div>

        {/* Notifications */}
        <div style={card}>
          <div style={sectionTitle}>Notification Preferences</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { key: 'lowStockAlerts', label: 'Low Stock Alerts', desc: 'Notify when medicines fall below reorder level' },
              { key: 'claimReminders', label: 'Insurance Claim Reminders', desc: 'Monthly reminder to submit pending claims' },
              { key: 'expiryWarnings', label: 'Expiry Warnings', desc: 'Alert 90 days before medicine expiry' },
              { key: 'dailySummary', label: 'Daily Sales Summary', desc: 'End-of-day sales report' },
            ].map(n => (
              <div key={n.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{n.label}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{n.desc}</div>
                </div>
                <button
                  onClick={() => setNotif({ ...notif, [n.key]: !(notif as any)[n.key] })}
                  style={{
                    width: 40, height: 22, borderRadius: 11, border: 'none',
                    backgroundColor: (notif as any)[n.key] ? '#32A287' : '#E5E7EB',
                    cursor: 'pointer', position: 'relative', transition: 'background-color 0.2s', flexShrink: 0,
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 3,
                    left: (notif as any)[n.key] ? 21 : 3,
                    width: 16, height: 16, borderRadius: '50%',
                    backgroundColor: 'white', transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  }} />
                </button>
              </div>
            ))}
          </div>
          <button onClick={savePrefs} style={btnPrimary}>Save Notifications</button>
        </div>

        {/* Danger Zone */}
        <div style={{ ...card, border: '1px solid #FEE2E2', backgroundColor: '#FFFAFA' }}>
          <div style={{ ...sectionTitle, color: '#DC2626', borderBottomColor: '#FEE2E2' }}>Danger Zone</div>
          <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 14, marginTop: 0 }}>
            These actions are permanent and cannot be undone.
          </p>
          <button style={{
            padding: '8px 18px', border: '1px solid #FCA5A5',
            backgroundColor: 'transparent', color: '#DC2626',
            borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>
            Export & Delete All Data
          </button>
        </div>

      </div>
    </div>
  );
};

export default OwnerSettings;