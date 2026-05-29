// Map from frontend origin to backend API prefix.
// One bundle deployed to many hosts uses this to pick the right backend.
const apiPrefixByOrigin: Record<string, string> = {
  'http://localhost:5888': 'http://localhost:5999',
};

export function getApiPrefix(): string {
  const origin = window.location.origin;
  const prefix = apiPrefixByOrigin[origin];
  if (!prefix) {
    throw new Error(`No API prefix configured for origin "${origin}"`);
  }
  return prefix;
}
