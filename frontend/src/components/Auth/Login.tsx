// src/components/Auth/Login.tsx
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
  Box,
  Flex,
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
    await login({
      email,
      password
    });

    // 🔥 Redirect after successful login
    navigate('/');

  } catch (err) {
    // handled in context
  } finally {
    setIsLoading(false);
  }
};

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#F5F7FA', display: 'flex', alignItems: 'center' }}>
      <Container size="xs" py="xl" style={{ width: '100%' }}>
        <Paper radius="lg" p="xl" withBorder style={{ backgroundColor: 'white' }}>
          <Stack gap="md">
            {/* Logo */}
            <Box ta="center" mb="sm">
              <Title order={1} c="primary" fw={600} style={{ fontSize: '2.5rem', color: '#1E88E5' }}>
                PharmaLink
              </Title>
              <Text c="dimmed" size="lg">
                Pharmacy Inventory Management
              </Text>
            </Box>

            <Title order={2} fw={500} ta="center">
              Welcome Back
            </Title>

            {/* Error Message */}
            {error && (
              <Paper p="sm" bg="red.0" c="red.7" radius="md" withBorder>
                <Text size="sm">{error}</Text>
              </Paper>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <TextInput
                  label="Email Address"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setValidationErrors({ ...validationErrors, email: undefined });
                  }}
                  error={validationErrors.email}
                  required
                  leftSection={<IconMail size={16} />}
                />

                <PasswordInput
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setValidationErrors({ ...validationErrors, password: undefined });
                  }}
                  error={validationErrors.password}
                  required
                  leftSection={<IconLock size={16} />}
                />

                <Button
                  fullWidth
                  type="submit"
                  size="md"
                  loading={isLoading}
                  styles={{
                    root: {
                      backgroundColor: '#1E88E5',
                      height: '44px',
                      '&:hover': { backgroundColor: '#1976D2' },
                    },
                  }}
                >
                  Login
                </Button>
              </Stack>
            </form>

            {/* Register Link */}
            <Text ta="center" size="sm">
              Don't have an account?{' '}
              <a href="/register" style={{ color: '#1E88E5', textDecoration: 'none', fontWeight: 600 }}>
                Create Account
              </a>
            </Text>

            {/* Security Badge */}
            <Flex align="center" justify="center" gap="xs" mt="md" pt="md" style={{ borderTop: '1px solid #E0E0E0' }}>
              <IconShieldLock size={16} color="#666" />
              <Text size="xs" c="dimmed">
                Secure pharmaceutical-grade encryption
              </Text>
            </Flex>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;