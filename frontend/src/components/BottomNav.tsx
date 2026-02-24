// src/components/BottomNav.tsx
import React from 'react';
import { Paper, Flex, ActionIcon, Tooltip } from '@mantine/core';
import {
  IconHome,
  IconPackage,
  IconAlertCircle,
  IconBuildingStore,
  IconSettings,
} from '@tabler/icons-react';

interface BottomNavProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  userRole?: 'owner' | 'employee' | 'authority';
}

const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate, userRole }) => {
  const navItems = [
    { screen: 'dashboard', icon: IconHome, label: 'Home' },
    { screen: 'inventory', icon: IconPackage, label: 'Inventory' },
    ...(userRole === 'owner' ? [{ screen: 'manage-stores', icon: IconBuildingStore, label: 'Stores' }] : []),
    { screen: 'expiry-list', icon: IconAlertCircle, label: 'Expiring' },
    { screen: 'settings', icon: IconSettings, label: 'Settings' },
  ];

  return (
    <Paper
      withBorder
      radius={0}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: 'white',
      }}
    >
      <Flex justify="space-around" align="center" p="xs">
        {navItems.map((item) => {
          const isActive = currentScreen === item.screen;
          return (
            <Tooltip key={item.screen} label={item.label} position="top">
              <ActionIcon
                variant={isActive ? 'filled' : 'subtle'}
                color={isActive ? 'primary' : 'gray'}
                size="xl"
                radius="md"
                onClick={() => onNavigate(item.screen)}
              >
                <item.icon size={24} />
              </ActionIcon>
            </Tooltip>
          );
        })}
      </Flex>
    </Paper>
  );
};

export default BottomNav;