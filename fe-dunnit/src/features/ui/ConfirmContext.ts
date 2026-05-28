import { createContext, useContext } from 'react'

export type ConfirmOptions = {
  title: string
  text?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

export type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

export const ConfirmContext = createContext<ConfirmFn | null>(null)

export function useConfirm(): ConfirmFn {
  const confirm = useContext(ConfirmContext)
  if (confirm === null) {
    throw new Error('useConfirm must be used inside <ConfirmProvider>')
  }
  return confirm
}
