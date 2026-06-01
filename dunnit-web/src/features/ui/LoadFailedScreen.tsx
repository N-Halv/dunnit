import { Box, Button, Typography } from '@mui/material';

type Props = {
  title: string;
  message: string;
};

// Full-screen error UI shown when a top-level provider fails to load.
// Used by ConfigProvider and UserProvider so retries look the same.
export function LoadFailedScreen({ title, message }: Props) {
  return (
    <Box className="dunnit-fullscreen-stack">
      <Typography variant="h2">{title}</Typography>
      <Typography
        variant="body2"
        color="error"
        className="dunnit-fullscreen-stack__message"
      >
        {message}
      </Typography>
      <Button variant="outlined" onClick={() => window.location.reload()}>
        Reload
      </Button>
    </Box>
  );
}
