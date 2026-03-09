// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import App from './App';
import { theme } from './theme';
import '@mantine/core/styles.css'; 
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
     <MantineProvider theme={theme} defaultColorScheme="light">
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </MantineProvider>
  </React.StrictMode>
);