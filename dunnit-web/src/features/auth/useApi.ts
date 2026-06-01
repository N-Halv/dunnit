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
// extracts a human-readable message from the standard ASP.NET Core error
// shapes: ProblemDetails (`detail` / `title`) and ValidationProblemDetails
// (`errors`). Falls back to a generic message when none are present.
async function extractUserMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.clone().json();
    if (body === null || typeof body !== 'object') {
      return GENERIC_ERROR_MESSAGE;
    }
    const obj = body as Record<string, unknown>;

    if (typeof obj.detail === 'string' && obj.detail.length > 0) {
      return obj.detail;
    }

    if (obj.errors !== null && typeof obj.errors === 'object') {
      const messages = Object.values(obj.errors as Record<string, unknown>)
        .flat()
        .filter((m): m is string => typeof m === 'string');
      if (messages.length > 0) return messages.join('; ');
    }

    if (typeof obj.title === 'string' && obj.title.length > 0) {
      return obj.title;
    }
  } catch {
    // Body wasn't JSON or couldn't be read; fall through to generic message.
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
