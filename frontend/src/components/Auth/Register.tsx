// src/components/Auth/Register.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Container, Paper, Title, Text, TextInput,
  PasswordInput, Button, Stack, Group, Box,
} from '@mantine/core';
import { IconMail, IconLock, IconUser, IconBuilding, IconLicense } from '@tabler/icons-react';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '', password: '', firstName: '',
    lastName: '', pharmacyName: '', licenseNumber: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLocalError(null);
  };

  const validateForm = () => {
    if (!formData.firstName) return 'First name is required';
    if (!formData.lastName) return 'Last name is required';
    if (!formData.email) return 'Email is required';
    if (!/^\S+@\S+$/.test(formData.email)) return 'Invalid email format';
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (!formData.pharmacyName) return 'Pharmacy name is required';
    if (!formData.licenseNumber) return 'License number is required';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) { setLocalError(validationError); return; }
    setIsLoading(true);
    setLocalError(null);
    try {
      await register({ ...formData, role: 'PHARMACY_OWNER' });
      alert('Registration successful! Please login with your credentials.');
      navigate('/login');
    } catch (err: any) {
      setLocalError(err.response?.data?.error || err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyles = {
    input: { borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#1a2235' },
    label: { color: '#374151', fontWeight: 500, fontSize: '0.875rem' },
  };

  return (
    <Box style={{
      minHeight: '100vh',
      backgroundColor: '#EFF7FF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 0',
    }}>
      <Container size="sm" style={{ width: '100%' }}>
        <Paper radius="xl" p={40} style={{
          backgroundColor: 'white',
          border: '1px solid #E8F0FE',
          boxShadow: '0 4px 24px rgba(50, 162, 135, 0.08)',
        }}>
          <Stack gap="lg">
            {/* Brand */}
            <Box ta="center">
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 48, height: 48, borderRadius: 14,
                backgroundColor: '#32A287', marginBottom: 10,
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <Title order={1} fw={700} style={{ color: '#201E50', fontSize: '1.5rem' }}>
                PharmaLink
              </Title>
              <Text size="sm" style={{ color: '#6B7280', marginTop: 2 }}>
                Create your pharmacy account
              </Text>
            </Box>

            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <Group grow>
                  <TextInput
                    label="First Name"
                    placeholder="First name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    leftSection={<IconUser size={16} color="#9CA3AF" />}
                    required
                    styles={inputStyles}
                  />
                  <TextInput
                    label="Last Name"
                    placeholder="Last name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    leftSection={<IconUser size={16} color="#9CA3AF" />}
                    required
                    styles={inputStyles}
                  />
                </Group>

                <TextInput
                  label="Email Address"
                  placeholder="you@example.com"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  leftSection={<IconMail size={16} color="#9CA3AF" />}
                  required
                  styles={inputStyles}
                />

                <PasswordInput
                  label="Password"
                  placeholder="Min. 6 characters"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  leftSection={<IconLock size={16} color="#9CA3AF" />}
                  required
                  styles={inputStyles}
                />

                <TextInput
                  label="Pharmacy Name"
                  placeholder="e.g. Goodlife Pharmacy"
                  name="pharmacyName"
                  value={formData.pharmacyName}
                  onChange={handleChange}
                  leftSection={<IconBuilding size={16} color="#9CA3AF" />}
                  required
                  styles={inputStyles}
                />

                <TextInput
                  label="License Number"
                  placeholder="e.g. RPB-2024-001"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  leftSection={<IconLicense size={16} color="#9CA3AF" />}
                  required
                  styles={inputStyles}
                />

                {(localError || error) && (
                  <Paper p="sm" radius="md" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5' }}>
                    <Text size="sm" style={{ color: '#DC2626' }}>{localError || error}</Text>
                  </Paper>
                )}

                <Button
                  type="submit"
                  fullWidth
                  size="md"
                  loading={isLoading}
                  style={{
                    backgroundColor: '#32A287',
                    height: 46,
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    marginTop: 4,
                  }}
                >
                  {isLoading ? 'Creating account...' : 'Register Pharmacy'}
                </Button>

                <Text ta="center" size="sm" style={{ color: '#6B7280' }}>
                  Already have an account?{' '}
                  <a href="/login" style={{ color: '#32A287', textDecoration: 'none', fontWeight: 600 }}>
                    Sign in
                  </a>
                </Text>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;