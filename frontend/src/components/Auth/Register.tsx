// src/components/Auth/Register.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Group,
  Box,
} from '@mantine/core';
import { IconMail, IconLock, IconUser, IconBuilding, IconLicense } from '@tabler/icons-react';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    pharmacyName: '',
    licenseNumber: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    
    setIsLoading(true);
    setLocalError(null);

    try {
      // Send as PHARMACY_OWNER by default (only role that can register)
      await register({
        ...formData,
        role: 'PHARMACY_OWNER'
      });
      
      alert('Registration successful! Please login with your credentials.');
      navigate('/login');
    } catch (err: any) {
      console.error('Registration error:', err);
      setLocalError(err.response?.data?.error || err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#F5F7FA', display: 'flex', alignItems: 'center' }}>
      <Container size="sm" py="xl">
        <Paper radius="lg" p="xl" withBorder>
          <Stack gap="lg">
            <Box ta="center">
              <Title order={1} c="primary" fw={600} style={{ color: '#1E88E5' }}>
                PharmaLink
              </Title>
              <Text c="dimmed">Register your pharmacy</Text>
            </Box>

            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <Group grow>
                  <TextInput
                    label="First Name *"
                    placeholder="Your first name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    leftSection={<IconUser size={16} />}
                    required
                  />
                  <TextInput
                    label="Last Name *"
                    placeholder="Your last name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    leftSection={<IconUser size={16} />}
                    required
                  />
                </Group>

                <TextInput
                  label="Email Address *"
                  placeholder="your@email.com"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  leftSection={<IconMail size={16} />}
                  required
                />

                <PasswordInput
                  label="Password *"
                  placeholder="Create password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  leftSection={<IconLock size={16} />}
                  required
                />

                <TextInput
                  label="Pharmacy Name *"
                  placeholder="Enter your pharmacy name"
                  name="pharmacyName"
                  value={formData.pharmacyName}
                  onChange={handleChange}
                  leftSection={<IconBuilding size={16} />}
                  required
                />

                <TextInput
                  label="License Number *"
                  placeholder="Enter pharmacy license number"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  leftSection={<IconLicense size={16} />}
                  required
                />

                {/* Error Display */}
                {(localError || error) && (
                  <Paper p="sm" bg="red.0" c="red.7" radius="md" withBorder>
                    <Text size="sm">{localError || error}</Text>
                  </Paper>
                )}

                <Button
                  type="submit"
                  fullWidth
                  size="md"
                  loading={isLoading}
                  styles={{
                    root: {
                      backgroundColor: '#43A047',
                      height: '44px',
                      '&:hover': { backgroundColor: '#2E7D32' },
                    },
                  }}
                >
                  {isLoading ? 'Creating account...' : 'Register Pharmacy'}
                </Button>

                <Text ta="center" size="sm">
                  Already have an account?{' '}
                  <a href="/login" style={{ color: '#1E88E5', textDecoration: 'none', fontWeight: 600 }}>
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