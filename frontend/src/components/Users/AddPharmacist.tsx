// src/components/Users/AddPharmacist.tsx
import React, { useState } from 'react';
import {
  Modal,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Text,
  Group,
} from '@mantine/core';
import { IconUser, IconMail, IconLock, IconBuilding } from '@tabler/icons-react';
import { useAuth } from '../../contexts/AuthContext';

interface AddPharmacistProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pharmacyId: number;
}

const AddPharmacist: React.FC<AddPharmacistProps> = ({ opened, onClose, onSuccess, pharmacyId }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    licenseNumber: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.firstName) return 'First name is required';
    if (!formData.lastName) return 'Last name is required';
    if (!formData.email) return 'Email is required';
    if (!/^\S+@\S+$/.test(formData.email)) return 'Invalid email format';
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const validationError = validateForm();
  if (validationError) {
    setError(validationError);
    return;
  }

  setIsLoading(true);
  setError('');

  try {
    const response = await fetch('/api/users/pharmacist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...formData,
        pharmacyId,
        role: 'PHARMACIST',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add pharmacist');
    }

    // Success
    onSuccess();
    onClose();
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      licenseNumber: '',
    });

  } catch (err: any) {
    setError(err.message || 'Failed to add pharmacist');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <Modal opened={opened} onClose={onClose} title="Add New Pharmacist" size="md">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Group grow>
            <TextInput
              label="First Name *"
              placeholder="First name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              leftSection={<IconUser size={16} />}
              required
            />
            <TextInput
              label="Last Name *"
              placeholder="Last name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              leftSection={<IconUser size={16} />}
              required
            />
          </Group>

          <TextInput
            label="Email *"
            placeholder="pharmacist@email.com"
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
            label="License Number *"
            placeholder="Pharmacist license number"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            leftSection={<IconBuilding size={16} />}
            required
          />

          {error && (
            <Paper p="xs" bg="red.0" c="red.7" radius="md">
              <Text size="sm">{error}</Text>
            </Paper>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isLoading} style={{ backgroundColor: '#1E88E5' }}>
              Add Pharmacist
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default AddPharmacist;
