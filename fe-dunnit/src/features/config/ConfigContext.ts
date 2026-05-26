import { createContext, useContext } from 'react'

export type Config = {
  testValue: string | null
  env: string | null
}

export const ConfigContext = createContext<Config | null>(null)

export function useConfig(): Config {
  const config = useContext(ConfigContext)
  if (config === null) {
    throw new Error('useConfig must be used inside <ConfigProvider>')
  }
  return config
}
