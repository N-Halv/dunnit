import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { UnauthorizedError, useApi } from '../auth/useApi';
import type { User } from './userSlice';
import { userError, userLoaded, userLoading } from './userSlice';

export function UserProvider({ children }: { children: ReactNode }) {
  const api = useApi();
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.user);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    dispatch(userLoading());

    api('/users/me')
      .then(async (r) => {
        if (!r.ok) {
          throw new Error(`/users/me failed: ${r.status} ${r.statusText}`);
        }
        return (await r.json()) as User;
      })
      .then((user) => {
        if (cancelled) return;
        dispatch(userLoaded(user));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof UnauthorizedError) return;
        const message = err instanceof Error ? err.message : String(err);
        dispatch(userError(message));
      });

    return () => {
      cancelled = true;
    };
  }, [api, dispatch, attempt]);

  if (state.status === 'error') {
    return (
      <div className="config-error">
        <h2>Failed to load user</h2>
        <p className="config-error__message">{state.error}</p>
        <button
          type="button"
          className="config-error__retry"
          onClick={() => setAttempt((a) => a + 1)}
        >
          Retry
        </button>
      </div>
    );
  }

  if (state.status !== 'loaded') {
    return (
      <div className="config-spinner">
        <div className="config-spinner__circle" />
      </div>
    );
  }

  return <>{children}</>;
}
