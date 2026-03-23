// src/pages/OwnerDashboard/OwnerSettings.tsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const API = 'http://localhost:3001/api';
const getToken = () => localStorage.getItem('token');

const OwnerSettings: React.FC = () => {
  const { isDark, toggleDark } = useTheme();
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

  // Load saved preferences
  useEffect(() => {
    const saved = localStorage.getItem('pharmalink-prefs');
    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        if (prefs.notif) setNotif(prefs.notif);
        if (prefs.currency) setCurrency(prefs.currency);
        if (prefs.taxRate !== undefined) setTaxRate(String(prefs.taxRate));
        if (prefs.timezone) setTimezone(prefs.timezone);
      } catch {}
    }
  }, []);

  const savePrefs = () => {
    localStorage.setItem('pharmalink-prefs', JSON.stringify({ notif, currency, taxRate, timezone }));
  };

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileMsg('');
    try {
      // Update via API — adjust endpoint if needed
      const res = await fetch(`${API}/users/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(profile)
      });
      if (res.ok) { setProfileMsg('✅ Profile updated successfully!'); }
      else { const d = await res.json(); setProfileMsg(`❌ ${d.error || 'Failed to update'}`); }
    } catch {
      setProfileMsg('❌ Failed to connect to server');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePwdChange = async () => {
    if (pwd.next !== pwd.confirm) { setPwdMsg('❌ New passwords do not match'); return; }
    if (pwd.next.length < 6) { setPwdMsg('❌ Password must be at least 6 characters'); return; }
    setPwdSaving(true); setPwdMsg('');
    try {
      const res = await fetch(`${API}/users/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ currentPassword: pwd.current, newPassword: pwd.next })
      });
      if (res.ok) { setPwdMsg('✅ Password changed!'); setPwd({ current: '', next: '', confirm: '' }); }
      else { const d = await res.json(); setPwdMsg(`❌ ${d.error || 'Failed'}`); }
    } catch { setPwdMsg('❌ Server error'); }
    finally { setPwdSaving(false); }
  };

  const card = `rounded-2xl border p-6 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`;
  const label = `block text-xs font-bold uppercase tracking-wide mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`;
  const input = `w-full px-3 py-2.5 border rounded-xl text-sm transition ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500'}`;
  const heading = `text-lg font-black mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Settings</h2>
        <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Manage your account and system preferences</p>
      </div>

      {/* Appearance */}
      <div className={card}>
        <h3 className={heading}>🎨 Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>Dark Mode</div>
            <div className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Switch between light and dark interface</div>
          </div>
          <button onClick={toggleDark}
            className={`w-12 h-6 rounded-full relative transition-colors ${isDark ? 'bg-blue-600' : 'bg-gray-300'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${isDark ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* Profile */}
      <div className={card}>
        <h3 className={heading}>👤 Profile</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>First Name</label>
            <input className={input} value={profile.firstName} onChange={e => setProfile({ ...profile, firstName: e.target.value })} />
          </div>
          <div>
            <label className={label}>Last Name</label>
            <input className={input} value={profile.lastName} onChange={e => setProfile({ ...profile, lastName: e.target.value })} />
          </div>
          <div>
            <label className={label}>Email</label>
            <input className={input} type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
          </div>
          <div>
            <label className={label}>Phone</label>
            <input className={input} value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="+250 7XX XXX XXX" />
          </div>
        </div>
        {profileMsg && <div className={`mt-3 text-sm font-medium ${profileMsg.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>{profileMsg}</div>}
        <button onClick={handleProfileSave} disabled={profileSaving}
          className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50">
          {profileSaving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {/* Change Password */}
      <div className={card}>
        <h3 className={heading}>🔒 Change Password</h3>
        <div className="space-y-3">
          {[
            { label: 'Current Password', key: 'current' },
            { label: 'New Password', key: 'next' },
            { label: 'Confirm New Password', key: 'confirm' },
          ].map(f => (
            <div key={f.key}>
              <label className={label}>{f.label}</label>
              <input type="password" className={input}
                value={(pwd as any)[f.key]}
                onChange={e => setPwd({ ...pwd, [f.key]: e.target.value })}
                placeholder="••••••••" />
            </div>
          ))}
        </div>
        {pwdMsg && <div className={`mt-2 text-sm font-medium ${pwdMsg.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>{pwdMsg}</div>}
        <button onClick={handlePwdChange} disabled={pwdSaving}
          className="mt-4 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-gray-900">
          {pwdSaving ? 'Changing...' : 'Change Password'}
        </button>
      </div>

      {/* System Preferences */}
      <div className={card}>
        <h3 className={heading}>⚙️ System Preferences</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Currency</label>
            <select className={input} value={currency} onChange={e => setCurrency(e.target.value)}>
              <option value="RWF">RWF – Rwandan Franc</option>
              <option value="USD">USD – US Dollar</option>
              <option value="EUR">EUR – Euro</option>
            </select>
          </div>
          <div>
            <label className={label}>VAT / Tax Rate (%)</label>
            <input type="number" className={input} value={taxRate}
              onChange={e => setTaxRate(e.target.value)}
              placeholder="0" min="0" max="100" />
          </div>
          <div className="col-span-2">
            <label className={label}>Timezone</label>
            <select className={input} value={timezone} onChange={e => setTimezone(e.target.value)}>
              <option value="Africa/Kigali">Africa/Kigali (UTC+2)</option>
              <option value="Africa/Nairobi">Africa/Nairobi (UTC+3)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
        <button onClick={savePrefs} className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700">
          Save Preferences
        </button>
      </div>

      {/* Notifications */}
      <div className={card}>
        <h3 className={heading}>🔔 Notification Preferences</h3>
        <div className="space-y-4">
          {[
            { key: 'lowStockAlerts', label: 'Low Stock Alerts', desc: 'Get notified when medicines fall below reorder level' },
            { key: 'claimReminders', label: 'Insurance Claim Reminders', desc: 'Reminder to submit pending claims monthly' },
            { key: 'expiryWarnings', label: 'Expiry Warnings', desc: 'Alert 90 days before medicine expiry dates' },
            { key: 'dailySummary', label: 'Daily Sales Summary', desc: 'Receive end-of-day sales summary' },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between">
              <div>
                <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{n.label}</div>
                <div className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{n.desc}</div>
              </div>
              <button
                onClick={() => setNotif({ ...notif, [n.key]: !(notif as any)[n.key] })}
                className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0 ${(notif as any)[n.key] ? 'bg-blue-600' : isDark ? 'bg-gray-700' : 'bg-gray-300'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${(notif as any)[n.key] ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </div>
        <button onClick={savePrefs} className="mt-5 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700">
          Save Notifications
        </button>
      </div>

      {/* Danger Zone */}
      <div className={`rounded-2xl border-2 border-red-200 p-6 ${isDark ? 'bg-red-900/10' : 'bg-red-50'}`}>
        <h3 className="text-lg font-black text-red-600 mb-1">⚠️ Danger Zone</h3>
        <p className={`text-xs mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>These actions are permanent and cannot be undone.</p>
        <button className="px-4 py-2 border-2 border-red-400 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition">
          Export & Delete All Data
        </button>
      </div>
    </div>
  );
};

export default OwnerSettings;