import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ConfigContext } from './ConfigContext'
import type { Config } from './ConfigContext'
import './ConfigProvider.css'

// Map from frontend origin to backend API prefix.
// One bundle deployed to many hosts uses this to pick the right backend.
const apiPrefixByOrigin: Record<string, string> = {
  'http://localhost:5173': 'http://localhost:5235',
}

function getApiPrefix(): string {
  const origin = window.location.origin
  const prefix = apiPrefixByOrigin[origin]
  if (!prefix) {
    throw new Error(`No API prefix configured for origin "${origin}"`)
  }
  return prefix
}

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Config | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false

    fetch(`${getApiPrefix()}/config`)
      .then((r) => {
        if (!r.ok) {
          throw new Error(`Config request failed: ${r.status} ${r.statusText}`)
        }
        return r.json()
      })
      .then((data: Config) => {
        if (cancelled) return
        console.log('testValue:', data.testValue)
        setConfig(data)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err : new Error(String(err)))
      })

    return () => {
      cancelled = true
    }
  }, [attempt])

  if (error !== null) {
    return (
      <div className="config-error">
        <h2>Failed to load configuration</h2>
        <p className="config-error__message">{error.message}</p>
        <button
          type="button"
          className="config-error__retry"
          onClick={() => {
            setError(null)
            setAttempt((a) => a + 1)
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  if (config === null) {
    return (
      <div className="config-spinner">
        <div className="config-spinner__circle" />
      </div>
    )
  }

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
}
