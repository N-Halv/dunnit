import { createContext, useContext } from 'react';

export type ToastSeverity = 'error' | 'success' | 'info' | 'warning';

export type ShowToast = (message: string, severity?: ToastSeverity) => void;

export const ToastContext = createContext<ShowToast | null>(null);

export function useToast(): ShowToast {
  const showToast = useContext(ToastContext);
  if (showToast === null) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }
  return showToast;
}
