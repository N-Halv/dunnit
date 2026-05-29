import { useAuth0 } from '@auth0/auth0-react';
import { useCallback } from 'react';

import { getApiPrefix } from '../../api/baseUrl';
import { useToast } from '../ui/ToastContext';

export class UnauthorizedError extends Error {
  constructor() {
    super('Request was unauthorized');
    this.name = 'UnauthorizedError';
  }
}

const GENERIC_ERROR_MESSAGE = 'An error occurred';

// Reads the response body (via clone, so the caller can still read it) and
// returns the userMessage field if the server provided one, otherwise a
// generic fallback.
async function extractUserMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.clone().json();
    if (
      body !== null &&
      typeof body === 'object' &&
      'userMessage' in body &&
      typeof (body as { userMessage: unknown }).userMessage === 'string'
    ) {
      return (body as { userMessage: string }).userMessage;
    }
  } catch {
    // body wasn't JSON or couldn't be read; fall through to generic message
  }
  return GENERIC_ERROR_MESSAGE;
}

export function useApi() {
  const { getAccessTokenSilently, loginWithRedirect, logout } = useAuth0();
  const showToast = useToast();

  return useCallback(
    async (path: string, init: RequestInit = {}) => {
      let token: string;
      try {
        token = await getAccessTokenSilently();
      } catch (err) {
        if (
          err != null &&
          typeof err === 'object' &&
          'error' in err &&
          (err as { error: unknown }).error === 'consent_required'
        ) {
          await loginWithRedirect({
            authorizationParams: { prompt: 'consent' },
          });
          throw new UnauthorizedError();
        }
        throw err;
      }
      const headers = new Headers(init.headers);
      headers.set('Authorization', `Bearer ${token}`);
      let response: Response;
      try {
        response = await fetch(`${getApiPrefix()}${path}`, {
          ...init,
          headers,
        });
      } catch (err) {
        showToast(GENERIC_ERROR_MESSAGE);
        throw err;
      }
      if (response.status === 401) {
        logout({ logoutParams: { returnTo: window.location.origin } });
        throw new UnauthorizedError();
      }
      if (!response.ok) {
        const message = await extractUserMessage(response);
        showToast(message);
      }
      return response;
    },
    [getAccessTokenSilently, loginWithRedirect, logout, showToast],
  );
}
