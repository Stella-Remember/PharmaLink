// src/theme.ts
import { createTheme } from '@mantine/core';

export const theme = createTheme({
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSizes: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
  },
  lineHeights: {
    xs: '1.5',
    sm: '1.5',
    md: '1.5',
    lg: '1.5',
    xl: '1.5',
  },
  colors: {
    // Custom primary blue matching Figma #1E88E5
    primary: [
      '#E3F2FD', // muted/light
      '#BBDEFB',
      '#90CAF9',
      '#64B5F6',
      '#42A5F5',
      '#1E88E5', // primary
      '#1976D2',
      '#1565C0',
      '#0D47A1',
      '#0A356E',
    ],
    // Custom secondary green matching Figma #43A047
    secondary: [
      '#E8F5E9',
      '#C8E6C9',
      '#A5D6A7',
      '#81C784',
      '#66BB6A',
      '#43A047', // secondary
      '#2E7D32',
      '#1B5E20',
      '#1B4D1B',
      '#0A2E0A',
    ],
    // Muted background matching Figma #E3F2FD
    muted: [
      '#F5F5F5',
      '#EEEEEE',
      '#E3F2FD', // muted
      '#E0E0E0',
      '#BDBDBD',
      '#9E9E9E',
      '#757575',
      '#616161', // muted-foreground
      '#424242',
      '#212121', // foreground
    ],
    // Destructive red matching Figma #E53935
    destructive: [
      '#FFEBEE',
      '#FFCDD2',
      '#EF9A9A',
      '#E57373',
      '#EF5350',
      '#E53935', // destructive
      '#D32F2F',
      '#C62828',
      '#B71C1C',
      '#8B0000',
    ],
  },
  primaryColor: 'primary',
  primaryShade: 5, // index 5 = #1E88E5
  radius: {
    xs: '0.5rem',
    sm: '0.625rem',
    md: '0.75rem', // matches your Figma radius
    lg: '1rem',
    xl: '1.25rem',
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.25rem',
    xl: '1.5rem',
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        root: {
          fontWeight: 500,
        },
      },
    },
    Card: {
      defaultProps: {
        radius: 'md',
        shadow: 'sm',
      },
    },
    Input: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        input: {
          backgroundColor: '#F5F5F5', // input-background from Figma
          borderColor: 'transparent',
          '&:focus': {
            borderColor: '#1E88E5',
          },
        },
      },
    },
    Paper: {
      defaultProps: {
        radius: 'md',
        shadow: 'sm',
      },
    },
  },
});