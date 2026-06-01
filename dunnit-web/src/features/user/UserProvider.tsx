import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { UnauthorizedError, useApi } from '../auth/useApi';
import { FullScreenSpinner } from '../ui/FullScreenSpinner';
import { LoadFailedScreen } from '../ui/LoadFailedScreen';
import type { User } from './userSlice';
import { userError, userLoaded, userLoading } from './userSlice';

export function UserProvider({ children }: { children: ReactNode }) {
  const api = useApi();
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.user);

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
  }, [api, dispatch]);

  if (state.status === 'error') {
    return (
      <LoadFailedScreen title="Failed to load user" message={state.error} />
    );
  }

  if (state.status !== 'loaded') {
    return <FullScreenSpinner />;
  }

  return <>{children}</>;
}
