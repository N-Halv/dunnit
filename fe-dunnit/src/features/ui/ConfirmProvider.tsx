import { useCallback, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import { ConfirmContext } from './ConfirmContext'
import type { ConfirmFn, ConfirmOptions } from './ConfirmContext'

type State = { open: boolean; options: ConfirmOptions }

const initialOptions: ConfirmOptions = { title: '' }

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ open: false, options: initialOptions })
  // Stored across renders so the resolved value reaches the awaiting caller
  // regardless of which button was clicked or how the dialog was dismissed.
  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback<ConfirmFn>((options) => {
    // If a previous prompt is still open, resolve it as cancelled so the old
    // caller's promise settles before we replace the dialog.
    resolveRef.current?.(false)
    setState({ open: true, options })
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve
    })
  }, [])

  function settle(value: boolean) {
    const resolve = resolveRef.current
    resolveRef.current = null
    setState((s) => ({ ...s, open: false }))
    resolve?.(value)
  }

  const { open, options } = state
  const confirmLabel = options.confirmLabel ?? (options.destructive ? 'Delete' : 'Confirm')
  const cancelLabel = options.cancelLabel ?? 'Cancel'

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog
        open={open}
        onClose={() => settle(false)}
        aria-labelledby="confirm-dialog-title"
      >
        <DialogTitle id="confirm-dialog-title">{options.title}</DialogTitle>
        {options.text ? (
          <DialogContent>
            <DialogContentText>{options.text}</DialogContentText>
          </DialogContent>
        ) : null}
        <DialogActions>
          <Button onClick={() => settle(false)} color="inherit">
            {cancelLabel}
          </Button>
          <Button
            onClick={() => settle(true)}
            color={options.destructive ? 'error' : 'primary'}
            variant="contained"
            autoFocus
          >
            {confirmLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmContext.Provider>
  )
}
