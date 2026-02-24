// src/components/DashboardScreen.tsx
import React from 'react';
import {
  Container,
  Grid,
  Card,
  Text,
  Title,
  Group,
  Badge,
  Button,
  SimpleGrid,
  Box,
  Paper,
  ThemeIcon,
} from '@mantine/core';
import {
  IconPill,
  IconAlertTriangle,
  IconCash,
  IconCalendar,
  IconPackage,
  IconReportAnalytics,
  IconSettings,
  IconUsers,
  IconBuildingStore,
  IconPlus,
  IconScan,
} from '@tabler/icons-react';

interface DashboardScreenProps {
  medicines: any[];
  onNavigate: (screen: string) => void;
  userRole?: 'owner' | 'employee' | 'authority';
  storeName?: string;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({
  medicines,
  onNavigate,
  userRole,
  storeName,
}) => {
  // Calculate stats
  const totalMedicines = medicines.length;
  const lowStockCount = medicines.filter(m => m.stock <= m.minStock).length;
  const expiringCount = medicines.filter(m => {
    const daysUntilExpiry = Math.ceil((new Date(m.expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30;
  }).length;

  // Quick actions based on role
  const quickActions = [
    ...(userRole === 'owner' ? [
      { icon: IconBuildingStore, label: 'Manage Stores', screen: 'manage-stores', color: 'blue' },
      { icon: IconUsers, label: 'Employees', screen: 'employees', color: 'green' },
    ] : []),
    { icon: IconPackage, label: 'Inventory', screen: 'inventory', color: 'violet' },
    { icon: IconPlus, label: 'Add Medicine', screen: 'add-medicine', color: 'cyan' },
    { icon: IconScan, label: 'Scan Barcode', screen: 'barcode-scanner', color: 'orange' },
    { icon: IconReportAnalytics, label: 'Reports', screen: 'reports', color: 'red' },
    { icon: IconSettings, label: 'Settings', screen: 'settings', color: 'gray' },
  ];

  return (
    <Box pb="xl">
      {/* Welcome Header */}
      <Paper bg="primary" c="white" p="xl" radius={0} style={{ backgroundColor: '#1E88E5' }}>
        <Container size="xl">
          <Group justify="space-between" align="center">
            <Box>
              <Title order={2} c="white">
                Welcome back, {userRole === 'owner' ? 'John' : 'Sarah'} 👋
              </Title>
              <Text c="white" opacity={0.9}>
                {storeName ? `Managing: ${storeName}` : userRole === 'authority' ? 'City Health Authority' : 'Pharmacist'}
              </Text>
            </Box>
            <Badge size="lg" variant="white" radius="sm">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Badge>
          </Group>
        </Container>
      </Paper>

      <Container size="xl" py="xl">
        {/* Stats Grid */}
        <Grid mb="xl">
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card withBorder padding="lg" radius="md">
              <Group justify="space-between">
                <Box>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Total Medicines
                  </Text>
                  <Title order={2}>{totalMedicines}</Title>
                  <Text size="sm" c="dimmed" mt="xs">
                    Unique products
                  </Text>
                </Box>
                <ThemeIcon size="xl" radius="md" variant="light" color="blue">
                  <IconPill size={28} />
                </ThemeIcon>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card withBorder padding="lg" radius="md">
              <Group justify="space-between">
                <Box>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Low Stock
                  </Text>
                  <Title order={2}>{lowStockCount}</Title>
                  <Text size="sm" c="red" mt="xs">
                    Requires attention
                  </Text>
                </Box>
                <ThemeIcon size="xl" radius="md" variant="light" color="yellow">
                  <IconAlertTriangle size={28} />
                </ThemeIcon>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card withBorder padding="lg" radius="md">
              <Group justify="space-between">
                <Box>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Expiring Soon
                  </Text>
                  <Title order={2}>{expiringCount}</Title>
                  <Text size="sm" c="orange" mt="xs">
                    Within 30 days
                  </Text>
                </Box>
                <ThemeIcon size="xl" radius="md" variant="light" color="orange">
                  <IconCalendar size={28} />
                </ThemeIcon>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card withBorder padding="lg" radius="md">
              <Group justify="space-between">
                <Box>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Today's Sales
                  </Text>
                  <Title order={2}>$0.00</Title>
                  <Text size="sm" c="dimmed" mt="xs">
                    No sales yet
                  </Text>
                </Box>
                <ThemeIcon size="xl" radius="md" variant="light" color="green">
                  <IconCash size={28} />
                </ThemeIcon>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Quick Actions */}
        <Title order={3} mb="md">
          Quick Actions
        </Title>
        <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} mb="xl">
          {quickActions.map((action) => (
            <Card
              key={action.label}
              withBorder
              padding="lg"
              radius="md"
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate(action.screen)}
            >
              <Group align="center" justify="center" style={{ flexDirection: 'column' }} gap="xs">
                <ThemeIcon size="xl" radius="md" color={action.color} variant="light">
                  <action.icon size={24} />
                </ThemeIcon>
                <Text size="sm" ta="center" fw={500}>
                  {action.label}
                </Text>
              </Group>
            </Card>
          ))}
        </SimpleGrid>

        {/* Low Stock Alerts */}
        <Group justify="space-between" mb="md">
          <Box>
            <Title order={3}>Low Stock Alerts</Title>
            <Text c="dimmed" size="sm">
              Medicines below reorder level
            </Text>
          </Box>
          <Button variant="light" onClick={() => onNavigate('inventory')}>
            View All
          </Button>
        </Group>

        <Card withBorder radius="md" mb="xl">
          <Box style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F5F7FA' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>MEDICINE</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>CURRENT STOCK</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>REORDER LEVEL</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>STATUS</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {medicines.filter(m => m.stock <= m.minStock).slice(0, 5).map((medicine) => (
                  <tr key={medicine.id} style={{ borderBottom: '1px solid #E0E0E0' }}>
                    <td style={{ padding: '12px', fontWeight: 500 }}>{medicine.name}</td>
                    <td style={{ padding: '12px' }}>{medicine.stock} units</td>
                    <td style={{ padding: '12px' }}>{medicine.minStock} units</td>
                    <td style={{ padding: '12px' }}>
                      <Badge color="red" radius="sm">
                        Low Stock
                      </Badge>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <Button variant="subtle" size="xs" onClick={() => onNavigate('inventory')}>
                        Order
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default DashboardScreen;