import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider as ReduxProvider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import './index.css'
import App from './App.tsx'
import { ConfigProvider } from './features/config/ConfigProvider.tsx'
import { AuthProvider } from './features/auth/AuthProvider.tsx'
import { UserProvider } from './features/user/UserProvider.tsx'
import { store } from './store/store.ts'
import { theme } from './theme/theme.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <ConfigProvider>
            <AuthProvider>
              <UserProvider>
                <App />
              </UserProvider>
            </AuthProvider>
          </ConfigProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ReduxProvider>
  </StrictMode>,
)
