import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/client';

const OwnerSettings: React.FC = () => {
  const { isDark, toggleDark } = useTheme();
  const { user } = useAuth();

  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: (user as any)?.phone || '',
  });

  const [profileMsg, setProfileMsg] = useState('');
  const [, setProfileSaving] = useState(false);

  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [pwdMsg, setPwdMsg] = useState('');

  const card = `rounded-xl border p-5 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`;

  const handleProfileSave = async () => {
    setProfileSaving(true);
    try {
      await api.put('/users/me', profile);
      setProfileMsg('Profile updated successfully');
    } catch {
      setProfileMsg('Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePwdChange = async () => {
    if (pwd.next !== pwd.confirm) return setPwdMsg('Passwords do not match');
    try {
      await api.post('/users/change-password', { currentPassword: pwd.current, newPassword: pwd.next });
      setPwdMsg('Password updated successfully');
    } catch {
      setPwdMsg('Failed to update password');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-semibold">Settings</h2>

      <div className={card}>
        <h3 className="font-semibold mb-3">Appearance</h3>
        <button onClick={toggleDark} className="px-4 py-2 bg-gray-200 rounded">
          {isDark ? 'Disable Dark Mode' : 'Enable Dark Mode'}
        </button>
      </div>

      <div className={card}>
        <h3 className="font-semibold mb-3">Profile</h3>
        <input className="input" value={profile.firstName} onChange={e => setProfile({ ...profile, firstName: e.target.value })} />
        <input className="input" value={profile.lastName} onChange={e => setProfile({ ...profile, lastName: e.target.value })} />
        <input className="input" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
        <button onClick={handleProfileSave} className="btn-primary mt-3">Save</button>
        {profileMsg && <p className="text-sm mt-2">{profileMsg}</p>}
      </div>

      <div className={card}>
        <h3 className="font-semibold mb-3">Change Password</h3>
        <input type="password" placeholder="Current password" onChange={e => setPwd({ ...pwd, current: e.target.value })} />
        <input type="password" placeholder="New password" onChange={e => setPwd({ ...pwd, next: e.target.value })} />
        <input type="password" placeholder="Confirm password" onChange={e => setPwd({ ...pwd, confirm: e.target.value })} />
        <button onClick={handlePwdChange} className="btn-primary mt-3">Update Password</button>
        {pwdMsg && <p className="text-sm mt-2">{pwdMsg}</p>}
      </div>
    </div>
  );
};

export default OwnerSettings;