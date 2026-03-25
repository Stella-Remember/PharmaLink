import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/client';

const OwnerSettings: React.FC = () => {
  const { isDark, toggleDark } = useTheme();
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: (user as any)?.phone || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [preferences, setPreferences] = useState({
    notifications: {
      lowStockAlerts: true,
      dailySummary: false,
      claimReminders: true,
      expiryWarnings: true,
    },
    currency: 'RWF',
    taxRate: 0,
    timezone: 'Africa/Kigali',
  });

  // Load saved preferences
  useEffect(() => {
    const saved = localStorage.getItem('pharmalink-preferences');
    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        setPreferences(prev => ({ ...prev, ...prefs }));
      } catch {}
    }
  }, []);

  const savePreferences = () => {
    localStorage.setItem('pharmalink-preferences', JSON.stringify(preferences));
    // Could also save to backend here
  };

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const response = await api.put('/users/me', profile);
      if (updateUser) updateUser(response.data);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.response?.data?.error || 'Failed to update profile' });
    } finally {
      setProfileSaving(false);
      setTimeout(() => setProfileMsg(null), 3000);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (passwordForm.new.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    
    setPasswordSaving(true);
    setPasswordMsg(null);
    try {
      await api.post('/users/change-password', {
        currentPassword: passwordForm.current,
        newPassword: passwordForm.new,
      });
      setPasswordMsg({ type: 'success', text: 'Password changed successfully' });
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.error || 'Failed to change password' });
    } finally {
      setPasswordSaving(false);
      setTimeout(() => setPasswordMsg(null), 3000);
    }
  };

  const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
      <h3 className={`text-base font-semibold mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      {children}
    </div>
  );

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className={`block text-xs font-medium uppercase tracking-wide mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
      {children}
    </label>
  );

  const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      {...props}
      className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors ${
        isDark
          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
      }`}
    />
  );

  const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select
      {...props}
      className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors ${
        isDark
          ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
      }`}
    />
  );

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
        enabled ? 'bg-blue-600' : isDark ? 'bg-gray-700' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
          enabled ? 'translate-x-4' : 'translate-x-0.5'
        } mt-0.5`}
      />
    </button>
  );

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account and system preferences</p>
      </div>

      {/* Appearance */}
      <SectionCard title="Appearance">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Switch between light and dark interface</div>
          </div>
          <Toggle enabled={isDark} onChange={toggleDark} />
        </div>
      </SectionCard>

      {/* Profile */}
      <SectionCard title="Profile Information">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>First Name</Label>
            <Input
              value={profile.firstName}
              onChange={e => setProfile({ ...profile, firstName: e.target.value })}
            />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input
              value={profile.lastName}
              onChange={e => setProfile({ ...profile, lastName: e.target.value })}
            />
          </div>
          <div>
            <Label>Email Address</Label>
            <Input
              type="email"
              value={profile.email}
              onChange={e => setProfile({ ...profile, email: e.target.value })}
            />
          </div>
          <div>
            <Label>Phone Number</Label>
            <Input
              value={profile.phone}
              onChange={e => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+250 XXX XXX XXX"
            />
          </div>
        </div>
        
        {profileMsg && (
          <div className={`mt-4 text-sm ${profileMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {profileMsg.text}
          </div>
        )}
        
        <button
          onClick={handleProfileSave}
          disabled={profileSaving}
          className="mt-5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {profileSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </SectionCard>

      {/* Change Password */}
      <SectionCard title="Change Password">
        <div className="space-y-4">
          <div>
            <Label>Current Password</Label>
            <Input
              type="password"
              value={passwordForm.current}
              onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })}
              placeholder="Enter current password"
            />
          </div>
          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              value={passwordForm.new}
              onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })}
              placeholder="Minimum 6 characters"
            />
          </div>
          <div>
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              value={passwordForm.confirm}
              onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
              placeholder="Confirm new password"
            />
          </div>
        </div>
        
        {passwordMsg && (
          <div className={`mt-4 text-sm ${passwordMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {passwordMsg.text}
          </div>
        )}
        
        <button
          onClick={handlePasswordChange}
          disabled={passwordSaving}
          className="mt-5 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {passwordSaving ? 'Changing...' : 'Update Password'}
        </button>
      </SectionCard>

      {/* System Preferences */}
      <SectionCard title="System Preferences">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Currency</Label>
            <Select
              value={preferences.currency}
              onChange={e => setPreferences({ ...preferences, currency: e.target.value })}
            >
              <option value="RWF">RWF - Rwandan Franc</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
            </Select>
          </div>
          <div>
            <Label>Tax Rate (VAT)</Label>
            <Input
              type="number"
              value={preferences.taxRate}
              onChange={e => setPreferences({ ...preferences, taxRate: parseFloat(e.target.value) || 0 })}
              placeholder="0"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
          <div className="col-span-2">
            <Label>Timezone</Label>
            <Select
              value={preferences.timezone}
              onChange={e => setPreferences({ ...preferences, timezone: e.target.value })}
            >
              <option value="Africa/Kigali">Africa/Kigali (UTC+2)</option>
              <option value="Africa/Nairobi">Africa/Nairobi (UTC+3)</option>
              <option value="UTC">UTC</option>
            </Select>
          </div>
        </div>
        
        <button
          onClick={savePreferences}
          className="mt-5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Save Preferences
        </button>
      </SectionCard>

      {/* Notifications */}
      <SectionCard title="Notification Preferences">
        <div className="space-y-4">
          {[
            { key: 'lowStockAlerts', label: 'Low Stock Alerts', desc: 'Get notified when medicines fall below reorder level' },
            { key: 'claimReminders', label: 'Insurance Claim Reminders', desc: 'Reminder to submit pending claims monthly' },
            { key: 'expiryWarnings', label: 'Expiry Warnings', desc: 'Alert 90 days before medicine expiry dates' },
            { key: 'dailySummary', label: 'Daily Sales Summary', desc: 'Receive end-of-day sales summary' },
          ].map(notification => (
            <div key={notification.key} className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{notification.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{notification.desc}</div>
              </div>
              <Toggle
                enabled={preferences.notifications[notification.key as keyof typeof preferences.notifications]}
                onChange={() => setPreferences({
                  ...preferences,
                  notifications: {
                    ...preferences.notifications,
                    [notification.key]: !preferences.notifications[notification.key as keyof typeof preferences.notifications],
                  },
                })}
              />
            </div>
          ))}
        </div>
        
        <button
          onClick={savePreferences}
          className="mt-5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Save Notification Settings
        </button>
      </SectionCard>

      {/* Danger Zone */}
      <div className={`rounded-xl border-2 border-red-200 p-6 ${isDark ? 'bg-red-900/5' : 'bg-red-50/50'}`}>
        <h3 className="text-base font-semibold text-red-600 mb-1">Danger Zone</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          These actions are permanent and cannot be undone.
        </p>
        <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
          Export & Delete All Data
        </button>
      </div>
    </div>
  );
};

export default OwnerSettings;