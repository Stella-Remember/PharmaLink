// src/components/Auth/Login.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Container, Paper, Title, Text, TextInput,
  PasswordInput, Button, Stack, Box, Flex,
} from '@mantine/core';
import { IconMail, IconLock, IconShieldLock } from '@tabler/icons-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email) errors.email = 'Email is required';
    else if (!/^\S+@\S+$/.test(email)) errors.email = 'Invalid email format';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      // handled in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box style={{
      minHeight: '100vh',
      backgroundColor: '#EFF7FF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Container size="xs" style={{ width: '100%' }}>
        <Paper radius="xl" p={40} style={{
          backgroundColor: 'white',
          border: '1px solid #E8F0FE',
          boxShadow: '0 4px 24px rgba(50, 162, 135, 0.08)',
        }}>
          <Stack gap="lg">
            {/* Brand - Enlarged logo, removed PharmaLink text */}
            <Box ta="center" mb={4}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}>
                <img 
                  src="/logo.png" 
                  alt="PharmaLink" 
                  style={{ 
                    width: 100, 
                    height: 100, 
                    objectFit: 'contain',
                  }} 
                />
              </div>
              {/* Removed PharmaLink title and Pharmacy Management System text */}
            </Box>

            <Title order={3} fw={600} ta="center" style={{ color: '#1a2235' }}>
              Sign in to your account
            </Title>

            {error && (
              <Paper p="sm" radius="md" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5' }}>
                <Text size="sm" style={{ color: '#DC2626' }}>{error}</Text>
              </Paper>
            )}

            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <TextInput
                  label="Email Address"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setValidationErrors({ ...validationErrors, email: undefined }); }}
                  error={validationErrors.email}
                  required
                  leftSection={<IconMail size={16} color="#9CA3AF" />}
                  styles={{
                    input: { borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#1a2235', '&:focus': { borderColor: '#32A287' } },
                    label: { color: '#374151', fontWeight: 500, fontSize: '0.875rem' },
                  }}
                />

                <PasswordInput
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setValidationErrors({ ...validationErrors, password: undefined }); }}
                  error={validationErrors.password}
                  required
                  leftSection={<IconLock size={16} color="#9CA3AF" />}
                  styles={{
                    input: { borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#1a2235' },
                    label: { color: '#374151', fontWeight: 500, fontSize: '0.875rem' },
                  }}
                />

                <Button
                  fullWidth
                  type="submit"
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
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Stack>
            </form>

            <Text ta="center" size="sm" style={{ color: '#6B7280' }}>
              Don't have an account?{' '}
              <a href="/register" style={{ color: '#32A287', textDecoration: 'none', fontWeight: 600 }}>
                Create account
              </a>
            </Text>

            <Flex align="center" justify="center" gap="xs" pt="md" style={{ borderTop: '1px solid #F3F4F6' }}>
              <IconShieldLock size={14} color="#9CA3AF" />
              <Text size="xs" style={{ color: '#9CA3AF' }}>
                Secured with pharmaceutical-grade encryption
              </Text>
            </Flex>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;