import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider as ReduxProvider } from 'react-redux'
import './index.css'
import App from './App.tsx'
import { ConfigProvider } from './features/config/ConfigProvider.tsx'
import { AuthProvider } from './features/auth/AuthProvider.tsx'
import { UserProvider } from './features/user/UserProvider.tsx'
import { store } from './store/store.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <ConfigProvider>
        <AuthProvider>
          <UserProvider>
            <App />
          </UserProvider>
        </AuthProvider>
      </ConfigProvider>
    </ReduxProvider>
  </StrictMode>,
)
