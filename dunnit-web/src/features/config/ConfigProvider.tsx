import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { getApiPrefix } from '../../api/baseUrl';
import { FullScreenSpinner } from '../ui/FullScreenSpinner';
import { LoadFailedScreen } from '../ui/LoadFailedScreen';
import type { Config } from './ConfigContext';
import { ConfigContext } from './ConfigContext';

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Config | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${getApiPrefix()}/config`)
      .then((r) => {
        if (!r.ok) {
          throw new Error(`Config request failed: ${r.status} ${r.statusText}`);
        }
        return r.json();
      })
      .then((data: Config) => {
        if (cancelled) return;
        setConfig(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error !== null) {
    return (
      <LoadFailedScreen
        title="Failed to load configuration"
        message={error.message}
      />
    );
  }

  if (config === null) {
    return <FullScreenSpinner />;
  }

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
}
