// src/theme.ts
import { createTheme } from '@mantine/core';

export const theme = createTheme({
  fontFamily: 'Numans, system-ui, sans-serif',
  fontFamilyMonospace: 'ui-monospace, monospace',
  headings: {
    fontFamily: 'Taviraj, system-ui, sans-serif',
  },
  fontSizes: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
  },
  colors: {
    // Steel Blue
    primary: [
      '#EFF7FF',
      '#D6EAF8',
      '#AED6F1',
      '#85C1E9',
      '#6AAED6',
      '#4F7CAC', // [5] main
      '#3D6A96',
      '#2E5580',
      '#201E50',
      '#16133A',
    ],
    // Seagrass
    accent: [
      '#E8F8F4',
      '#C3EDE4',
      '#86D9C7',
      '#50C5AA',
      '#3DAF93',
      '#32A287', // [5] main
      '#268A72',
      '#1C705C',
      '#125546',
      '#093B30',
    ],
    // Dark surfaces
    dark: [
      '#EFF7FF', // [0] text
      '#8FA8C2', // [1] muted text
      '#2A2845', // [2] elevated
      '#22203A', // [3] card
      '#1C1A2E', // [4] surface
      '#141318', // [5] base bg
      '#0E0C18',
      '#080711',
      '#040309',
      '#010105',
    ],
  },
  primaryColor: 'accent',
  primaryShade: 5,
  radius: {
    xs: '0.375rem',
    sm: '0.5rem',
    md: '0.75rem',
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
      defaultProps: { radius: 'md' },
      styles: { root: { fontWeight: 500 } },
    },
    Card: {
      defaultProps: { radius: 'md', shadow: 'sm' },
      styles: {
        root: {
          backgroundColor: '#22203A',
          border: '1px solid #2E2C4A',
        },
      },
    },
    Input: {
      defaultProps: { radius: 'md' },
      styles: {
        input: {
          backgroundColor: '#22203A',
          borderColor: '#2E2C4A',
          color: '#EFF7FF',
          '&:focus': { borderColor: '#32A287' },
          '&::placeholder': { color: 'rgba(239,247,255,0.3)' },
        },
      },
    },
    Paper: {
      defaultProps: { radius: 'md', shadow: 'sm' },
      styles: {
        root: {
          backgroundColor: '#1C1A2E',
          border: '1px solid #2E2C4A',
        },
      },
    },
  },
});