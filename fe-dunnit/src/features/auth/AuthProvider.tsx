import { Auth0Provider, useAuth0 } from '@auth0/auth0-react'
import type { ReactNode } from 'react'
import { useConfig } from '../config/ConfigContext'
import { LoginScreen } from './LoginScreen'

function AuthGate({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth0()

  if (isLoading) {
    return (
      <div className="config-spinner">
        <div className="config-spinner__circle" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  return <>{children}</>
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth0 } = useConfig()

  return (
    <Auth0Provider
      domain={auth0.domain}
      clientId={auth0.clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: auth0.audience,
      }}
    >
      <AuthGate>{children}</AuthGate>
    </Auth0Provider>
  )
}
