import { createContext, useContext } from 'react'
import type { components } from '../../api/schema'

export type Config = components['schemas']['ConfigResponse']

export const ConfigContext = createContext<Config | null>(null)

export function useConfig(): Config {
  const config = useContext(ConfigContext)
  if (config === null) {
    throw new Error('useConfig must be used inside <ConfigProvider>')
  }
  return config
}
