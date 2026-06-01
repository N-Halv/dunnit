import { Box, CircularProgress } from '@mui/material';

// Centered spinner used while top-level providers are still initializing
// (config, auth, current user). Shared so the loading UI is identical
// across the boot sequence.
export function FullScreenSpinner() {
  return (
    <Box className="dunnit-fullscreen-center">
      <CircularProgress />
    </Box>
  );
}
