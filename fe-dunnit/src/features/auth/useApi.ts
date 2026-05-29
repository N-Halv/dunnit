import { useAuth0 } from '@auth0/auth0-react'
import { useCallback } from 'react'
import { getApiPrefix } from '../../api/baseUrl'

export class UnauthorizedError extends Error {
  constructor() {
    super('Request was unauthorized')
    this.name = 'UnauthorizedError'
  }
}

export function useApi() {
  const { getAccessTokenSilently, loginWithRedirect, logout } = useAuth0()

  return useCallback(
    async (path: string, init: RequestInit = {}) => {
      let token: string
      try {
        token = await getAccessTokenSilently()
      } catch (err) {
        if (
          err != null &&
          typeof err === 'object' &&
          'error' in err &&
          (err as { error: unknown }).error === 'consent_required'
        ) {
          await loginWithRedirect({
            authorizationParams: { prompt: 'consent' },
          })
          throw new UnauthorizedError()
        }
        throw err
      }
      const headers = new Headers(init.headers)
      headers.set('Authorization', `Bearer ${token}`)
      const response = await fetch(`${getApiPrefix()}${path}`, {
        ...init,
        headers,
      })
      if (response.status === 401) {
        logout({ logoutParams: { returnTo: window.location.origin } })
        throw new UnauthorizedError()
      }
      return response
    },
    [getAccessTokenSilently, loginWithRedirect, logout],
  )
}
