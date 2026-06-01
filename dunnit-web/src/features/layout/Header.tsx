import { useAuth0 } from '@auth0/auth0-react';
import PersonIcon from '@mui/icons-material/Person';
import { AppBar, Box, Toolbar } from '@mui/material';

import { useAppSelector } from '../../store/hooks';
import { IconMenu } from '../ui/IconMenu';

export function Header() {
  const userState = useAppSelector((s) => s.user);
  const { logout } = useAuth0();

  const showSettings = userState.status === 'loaded';

  return (
    <AppBar>
      <Toolbar>
        <Box
          component="img"
          src="/logo.svg"
          alt="Dunnit"
          className="dunnit-header-logo"
        />

        {showSettings && (
          <IconMenu
            ariaLabel="Settings"
            icon={<PersonIcon fontSize="small" />}
            items={[
              { content: `Logged in as ${userState.user.email}` },
              {
                content: 'Logout',
                action: () =>
                  logout({
                    logoutParams: { returnTo: window.location.origin },
                  }),
              },
            ]}
          />
        )}
      </Toolbar>
    </AppBar>
  );
}
