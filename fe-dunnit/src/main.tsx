import './index.css';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import App from './App.tsx';
import { AuthProvider } from './features/auth/AuthProvider.tsx';
import { ConfigProvider } from './features/config/ConfigProvider.tsx';
import { ConfirmProvider } from './features/ui/ConfirmProvider.tsx';
import { UserProvider } from './features/user/UserProvider.tsx';
import { store } from './store/store.ts';
import { theme } from './theme/theme.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ConfirmProvider>
          <BrowserRouter>
            <ConfigProvider>
              <AuthProvider>
                <UserProvider>
                  <App />
                </UserProvider>
              </AuthProvider>
            </ConfigProvider>
          </BrowserRouter>
        </ConfirmProvider>
      </ThemeProvider>
    </ReduxProvider>
  </StrictMode>,
);
