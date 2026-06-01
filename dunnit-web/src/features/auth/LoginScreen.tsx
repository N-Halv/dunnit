import { useAuth0 } from '@auth0/auth0-react';
import { Box, Button, Typography } from '@mui/material';

export function LoginScreen() {
  const { loginWithRedirect } = useAuth0();

  return (
    <Box className="dunnit-fullscreen-stack">
      <Typography variant="h1">Welcome to Dunnit</Typography>
      <Typography
        variant="body2"
        className="dunnit-login__subtitle"
      >
        Sign in to access your todo lists.
      </Typography>
      <Button variant="outlined" onClick={() => loginWithRedirect()}>
        Log in
      </Button>
    </Box>
  );
}
