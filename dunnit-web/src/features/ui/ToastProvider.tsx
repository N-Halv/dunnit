import { Alert, Snackbar, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';

import type { ShowToast, ToastSeverity } from './ToastContext';
import { ToastContext } from './ToastContext';

type ToastMessage = {
  key: number;
  message: string;
  severity: ToastSeverity;
};

type State = {
  current: ToastMessage | null;
  open: boolean;
  queue: ToastMessage[];
};

const initialState: State = { current: null, open: false, queue: [] };

export function ToastProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [state, setState] = useState<State>(initialState);

  const showToast = useCallback<ShowToast>((message, severity = 'error') => {
    const msg: ToastMessage = {
      key: Date.now() + Math.random(),
      message,
      severity,
    };
    setState((s) =>
      s.current === null
        ? { current: msg, open: true, queue: [] }
        : { ...s, queue: [...s.queue, msg] },
    );
  }, []);

  const close = () => setState((s) => ({ ...s, open: false }));

  // After the slide-out transition completes, promote the next queued toast
  // (or go idle). Doing this in onExited rather than an effect avoids the
  // react-hooks/set-state-in-effect cascade.
  const handleExited = () =>
    setState((s) => {
      if (s.queue.length === 0) return { ...s, current: null };
      const [next, ...rest] = s.queue;
      return { current: next, open: true, queue: rest };
    });

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {state.current ? (
        <Snackbar
          key={state.current.key}
          open={state.open}
          autoHideDuration={4000}
          onClose={(_e, reason) => {
            if (reason === 'clickaway') return;
            close();
          }}
          slotProps={{ transition: { onExited: handleExited } }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: isMobile ? 'center' : 'right',
          }}
        >
          <Alert
            onClose={close}
            severity={state.current.severity}
            variant="filled"
          >
            {state.current.message}
          </Alert>
        </Snackbar>
      ) : null}
    </ToastContext.Provider>
  );
}
