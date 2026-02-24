// src/components/Users/PharmacistsList.tsx
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  Text,
  Button,
  Group,
  ActionIcon,
  Badge,
  Loader,
} from '@mantine/core';
import { IconEdit, IconTrash, IconUserPlus } from '@tabler/icons-react';
import { useAuth } from '../../contexts/AuthContext';
import AddPharmacist from './AddPharmacist';

interface Pharmacist {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  licenseNumber: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const PharmacistsList: React.FC = () => {
  const [pharmacists, setPharmacists] = useState<Pharmacist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const { token, user } = useAuth();

  // convert the possibly‑string/undefined id coming from the user context
  const pharmacyId: number | undefined = user?.pharmacyId
    ? Number(user.pharmacyId)
    : undefined;

  const fetchPharmacists = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/pharmacists', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch pharmacists');
      }
      
      setPharmacists(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'PHARMACY_OWNER') {
      fetchPharmacists();
    }
  }, [user]);

  if (loading) return <Loader />;
  if (error) return <Text c="red">{error}</Text>;

  return (
    <Paper p="md" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Text size="xl" fw={600}>My Pharmacists</Text>
        <Button
          leftSection={<IconUserPlus size={16} />}
          onClick={() => setAddModalOpen(true)}
          style={{ backgroundColor: '#1E88E5' }}
        >
          Add Pharmacist
        </Button>
      </Group>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>License #</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {pharmacists.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={5} ta="center">
                No pharmacists added yet. Click "Add Pharmacist" to get started.
              </Table.Td>
            </Table.Tr>
          ) : (
            pharmacists.map((pharmacist) => (
              <Table.Tr key={pharmacist.id}>
                <Table.Td>{pharmacist.firstName} {pharmacist.lastName}</Table.Td>
                <Table.Td>{pharmacist.email}</Table.Td>
                <Table.Td>{pharmacist.licenseNumber}</Table.Td>
                <Table.Td>
                  <Badge color={pharmacist.status === 'ACTIVE' ? 'green' : 'gray'}>
                    {pharmacist.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon variant="subtle" color="blue">
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="red">
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>

      {pharmacyId !== undefined && (
        <AddPharmacist
          opened={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSuccess={fetchPharmacists}
          pharmacyId={pharmacyId}
        />
      )}
    </Paper>
  );
};

export default PharmacistsList;