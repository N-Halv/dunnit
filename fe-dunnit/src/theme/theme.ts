import { createTheme } from '@mui/material/styles'

// Design tokens taken from the desktop/mobile mocks (see /mocks).
// Keep ALL styling decisions here — no sx, no local CSS files.
const colors = {
  headerBg: '#1A2744',
  primary: '#3B5BDB',
  primaryHover: '#5B7FFF',
  selectedBg: '#EEF2FF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#A0AEBF',
  border: '#E4E8F0',
  borderStrong: '#C8D0DC',
  iconMuted: '#C8D3DF',
  iconStrong: '#8EA3C0',
  star: '#F59E0B',
  danger: '#B91C1C',
  surface: '#FFFFFF',
  pageBg: '#F7F8FA',
} as const

declare module '@mui/material/styles' {
  interface Palette {
    headerBar: { main: string; contrastText: string }
  }
  interface PaletteOptions {
    headerBar?: { main: string; contrastText: string }
  }
  interface TypographyVariants {
    brand: React.CSSProperties
    sectionLabel: React.CSSProperties
  }
  interface TypographyVariantsOptions {
    brand?: React.CSSProperties
    sectionLabel?: React.CSSProperties
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    brand: true
    sectionLabel: true
  }
}

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary,
      light: colors.primaryHover,
      contrastText: '#FFFFFF',
    },
    error: {
      main: colors.danger,
    },
    background: {
      default: colors.pageBg,
      paper: colors.surface,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
      disabled: colors.textMuted,
    },
    divider: colors.border,
    action: {
      selected: colors.selectedBg,
      hover: 'rgba(59, 91, 219, 0.04)',
    },
    headerBar: {
      main: colors.headerBg,
      contrastText: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: { fontSize: '1.75rem', fontWeight: 600 },
    h2: { fontSize: '1.25rem', fontWeight: 600 },
    h3: { fontSize: '1.0625rem', fontWeight: 600 },
    body1: { fontSize: '0.875rem' },
    body2: { fontSize: '0.8125rem', color: colors.textSecondary },
    button: { textTransform: 'none', fontWeight: 500 },
    brand: {
      fontSize: '1.1875rem',
      fontWeight: 700,
      color: '#FFFFFF',
      flex: 1,
      letterSpacing: 0,
    },
    sectionLabel: {
      fontSize: '0.625rem',
      fontWeight: 700,
      letterSpacing: '0.07em',
      color: colors.textMuted,
      textTransform: 'uppercase',
      display: 'block',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.pageBg,
          color: colors.textPrimary,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        '#root': {
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        },
        '.dunnit-pane-section-header': {
          padding: '12px 14px 4px',
        },
        '.dunnit-pane-error': {
          padding: '16px',
        },
        '.dunnit-layout': {
          display: 'flex',
          alignItems: 'stretch',
          flex: 1,
          minHeight: 0,
        },
        '.dunnit-layout__lists': {
          width: 240,
          flexShrink: 0,
          borderRight: `1px solid ${colors.border}`,
          backgroundColor: colors.surface,
        },
        '.dunnit-layout__items': {
          flex: 1,
          minWidth: 0,
          backgroundColor: colors.surface,
        },
        '.dunnit-pane-header': {
          padding: '14px 18px 12px',
          borderBottom: `1px solid ${colors.border}`,
        },
        '.dunnit-pane-empty': {
          padding: 32,
          color: colors.textMuted,
          fontSize: '0.875rem',
          textAlign: 'center',
        },
        '.dunnit-item-title': {
          flex: 1,
          minWidth: 0,
          cursor: 'text',
          fontSize: '0.8125rem',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          padding: '4px 0',
        },
        '.dunnit-item-expanded': {
          margin: '2px 14px 6px 56px',
          padding: '8px 12px 10px',
          borderLeft: `2px solid ${colors.primaryHover}`,
          borderRadius: '0 4px 4px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        },
        '.dunnit-item-description': {
          cursor: 'text',
          whiteSpace: 'pre-wrap',
          margin: 0,
          fontSize: '0.75rem',
          lineHeight: 1.6,
          color: colors.textSecondary,
        },
        '.dunnit-item-description--empty': {
          fontStyle: 'italic',
          color: colors.textMuted,
        },
        '.dunnit-item-delete': {
          alignSelf: 'flex-start',
          fontSize: '0.75rem',
          color: colors.danger,
          textDecoration: 'underline',
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          padding: 0,
          fontFamily: 'inherit',
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, position: 'static' },
      styleOverrides: {
        root: {
          backgroundColor: colors.headerBg,
          color: '#FFFFFF',
          backgroundImage: 'none',
          '& .MuiIconButton-root': {
            color: 'rgba(255,255,255,0.85)',
            backgroundColor: 'rgba(255,255,255,0.10)',
            borderRadius: 7,
            width: 36,
            height: 36,
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.18)',
            },
          },
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 56,
          paddingLeft: 18,
          paddingRight: 12,
          gap: 8,
          '@media (min-width:600px)': {
            minHeight: 56,
            paddingLeft: 18,
            paddingRight: 12,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: colors.iconStrong,
          padding: 6,
          borderRadius: 6,
          '&:hover': {
            backgroundColor: 'rgba(15, 23, 42, 0.04)',
          },
        },
        sizeSmall: {
          padding: 4,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          marginTop: 8,
          minWidth: 220,
          borderRadius: 10,
          border: `1px solid ${colors.border}`,
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
        },
        list: {
          paddingTop: 6,
          paddingBottom: 6,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          paddingTop: 8,
          paddingBottom: 8,
          '&.Mui-disabled': {
            opacity: 1,
            color: colors.textSecondary,
            fontSize: '0.8125rem',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: colors.border },
      },
    },
    MuiSkeleton: {
      defaultProps: { animation: 'wave' },
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(15, 23, 42, 0.06)',
        },
      },
    },
    MuiList: {
      defaultProps: { disablePadding: true },
      styleOverrides: {
        root: {
          paddingTop: 0,
          paddingBottom: 0,
        },
      },
    },
    MuiListItemButton: {
      defaultProps: { disableRipple: false, disableGutters: true },
      styleOverrides: {
        root: {
          minHeight: 40,
          paddingLeft: 10,
          paddingRight: 10,
          marginLeft: 6,
          marginRight: 6,
          borderRadius: 8,
          gap: 6,
          color: colors.textPrimary,
          '&:hover': {
            backgroundColor: 'rgba(59, 91, 219, 0.04)',
          },
          '&.Mui-selected': {
            backgroundColor: colors.selectedBg,
            color: colors.primary,
            '&:hover': {
              backgroundColor: colors.selectedBg,
            },
          },
          '&.dunnit-row--placeholder': {
            opacity: 0.5,
            '& .MuiListItemText-primary': {
              color: colors.textMuted,
              fontWeight: 400,
            },
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        root: {
          margin: 0,
          flex: 1,
          minWidth: 0,
        },
        primary: {
          fontSize: '0.8125rem',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontSize: '0.8125rem',
          backgroundColor: '#FFFFFF',
          '& fieldset': {
            borderColor: colors.border,
          },
          '&:hover fieldset': {
            borderColor: colors.borderStrong,
          },
          '&.Mui-focused fieldset': {
            borderColor: colors.primary,
            borderWidth: 1,
          },
        },
        input: {
          padding: '6px 8px',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.0625rem',
          fontWeight: 600,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          padding: '6px 14px',
        },
      },
    },
  },
})

export { colors }
