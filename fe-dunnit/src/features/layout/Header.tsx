import { useState } from 'react'
import {
  AppBar,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import SettingsIcon from '@mui/icons-material/Settings'
import ViewListIcon from '@mui/icons-material/ViewList'
import { useAuth0 } from '@auth0/auth0-react'
import { useMatch, useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'

export function Header() {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isItemsRoute = Boolean(useMatch('/lists/:id'))
  const userState = useAppSelector((s) => s.user)
  const { logout } = useAuth0()

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const isMenuOpen = Boolean(anchorEl)

  const showSettings = userState.status === 'loaded'
  const showListsToggle = showSettings && isMobile && isItemsRoute

  return (
    <AppBar>
      <Toolbar>
        <Typography variant="brand" component="div">
          Dunnit
        </Typography>

        {showListsToggle && (
          <IconButton
            aria-label="Show lists"
            onClick={() => navigate('/')}
          >
            <ViewListIcon fontSize="small" />
          </IconButton>
        )}

        {showSettings && (
          <>
            <IconButton
              aria-label="Settings"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen ? 'true' : undefined}
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={isMenuOpen}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem disabled>
                Logged in as {userState.user.email}
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => {
                  setAnchorEl(null)
                  logout({ logoutParams: { returnTo: window.location.origin } })
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  )
}
