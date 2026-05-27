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
  const { getAccessTokenSilently, logout } = useAuth0()

  return useCallback(
    async (path: string, init: RequestInit = {}) => {
      const token = await getAccessTokenSilently()
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
    [getAccessTokenSilently, logout],
  )
}
