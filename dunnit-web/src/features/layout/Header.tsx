import { useAuth0 } from '@auth0/auth0-react';
import SettingsIcon from '@mui/icons-material/Settings';
import ViewListIcon from '@mui/icons-material/ViewList';
import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMatch, useNavigate } from 'react-router-dom';

import { useAppSelector } from '../../store/hooks';
import { IconMenu } from '../ui/IconMenu';

export function Header() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isItemsRoute = Boolean(useMatch('/lists/:id'));
  const userState = useAppSelector((s) => s.user);
  const { logout } = useAuth0();

  const showSettings = userState.status === 'loaded';
  const showListsToggle = showSettings && isMobile && isItemsRoute;

  return (
    <AppBar>
      <Toolbar>
        <Box component="img" src="/logo.svg" alt="Dunnit" className="dunnit-header-logo" />

        {showListsToggle && (
          <IconButton aria-label="Show lists" onClick={() => navigate('/')}>
            <ViewListIcon fontSize="small" />
          </IconButton>
        )}

        {showSettings && (
          <IconMenu
            ariaLabel="Settings"
            icon={<SettingsIcon fontSize="small" />}
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
