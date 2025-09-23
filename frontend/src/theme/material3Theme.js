import { createTheme } from '@mui/material/styles';

// Material 3 Design Theme for Football/Futsal Platform
// Minimal color approach with vivid colors only for badges/icons

const material3Theme = createTheme({
  cssVariables: true,

  colorSchemes: {
    light: {
      palette: {
        mode: 'light',
        primary: {
          main: '#282828', // Dark gray for light mode
          light: '#424242',
          dark: '#1a1a1a',
          contrastText: '#fefefe',
        },
        secondary: {
          main: '#666666',
          light: '#858585',
          dark: '#4a4a4a',
          contrastText: '#fefefe',
        },
        // Vivid colors for badges/icons only
        success: {
          main: '#4CAF50', // Green for goals/wins
          light: '#66BB6A',
          dark: '#388E3C',
          contrastText: '#ffffff',
        },
        warning: {
          main: '#FFC107', // Amber for cautions
          light: '#FFCD38',
          dark: '#FFA000',
          contrastText: '#000000',
        },
        error: {
          main: '#F44336', // Red for defeats/errors
          light: '#E57373',
          dark: '#D32F2F',
          contrastText: '#ffffff',
        },
        info: {
          main: '#2196F3', // Blue for information
          light: '#42A5F5',
          dark: '#1976D2',
          contrastText: '#ffffff',
        },
        background: {
          default: '#fafafa',
          paper: '#ffffff',
        },
        surface: {
          main: '#ffffff',
          variant: '#f5f5f5',
        },
        text: {
          primary: '#282828',
          secondary: '#666666',
        },
        divider: 'rgba(0, 0, 0, 0.08)',
      },
    },
    dark: {
      palette: {
        mode: 'dark',
        primary: {
          main: '#fefefe', // Almost white for dark mode
          light: '#ffffff',
          dark: '#e8e8e8',
          contrastText: '#282828',
        },
        secondary: {
          main: '#b0b0b0',
          light: '#cccccc',
          dark: '#999999',
          contrastText: '#282828',
        },
        // Same vivid colors for badges/icons
        success: {
          main: '#4CAF50',
          light: '#66BB6A',
          dark: '#388E3C',
          contrastText: '#ffffff',
        },
        warning: {
          main: '#FFC107',
          light: '#FFCD38',
          dark: '#FFA000',
          contrastText: '#000000',
        },
        error: {
          main: '#F44336',
          light: '#E57373',
          dark: '#D32F2F',
          contrastText: '#ffffff',
        },
        info: {
          main: '#2196F3',
          light: '#42A5F5',
          dark: '#1976D2',
          contrastText: '#ffffff',
        },
        background: {
          default: '#121212',
          paper: '#1e1e1e',
        },
        surface: {
          main: '#1e1e1e',
          variant: '#2a2a2a',
        },
        text: {
          primary: '#fefefe',
          secondary: '#b0b0b0',
        },
        divider: 'rgba(255, 255, 255, 0.08)',
      },
    },
  },

  // Modern typography
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.025em',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.025em',
      lineHeight: 1.25,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.015em',
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '-0.015em',
      lineHeight: 1.35,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.45,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.4,
    },
  },

  // Material 3 shape system
  shape: {
    borderRadius: 12,
  },

  spacing: 8,

  components: {
    // Global baseline
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
        },
      },
    },

    // AppBar - Clean minimal header
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: 'none',
          boxShadow: '0 1px 0 rgba(0, 0, 0, 0.05)',
          '@media (prefers-color-scheme: dark)': {
            backgroundColor: 'rgba(18, 18, 18, 0.95)',
            boxShadow: '0 1px 0 rgba(255, 255, 255, 0.05)',
          },
        },
      },
    },

    // Button - Material 3 style
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20, // M3 pill shape
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderWidth: 1.5,
          '&:hover': {
            borderWidth: 1.5,
            backgroundColor: 'rgba(40, 40, 40, 0.04)',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(40, 40, 40, 0.04)',
          },
        },
      },
    },

    // Card - Competition cards with minimal style
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
          '@media (prefers-color-scheme: dark)': {
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            },
          },
        },
      },
    },

    // Paper
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid rgba(0, 0, 0, 0.05)',
          '@media (prefers-color-scheme: dark)': {
            border: '1px solid rgba(255, 255, 255, 0.05)',
          },
        },
      },
    },

    // TextField - Clean input style
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '& fieldset': {
              borderWidth: 1.5,
              borderColor: 'rgba(0, 0, 0, 0.15)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(40, 40, 40, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderWidth: 2,
              borderColor: '#282828',
            },
            '@media (prefers-color-scheme: dark)': {
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(254, 254, 254, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#fefefe',
              },
            },
          },
        },
      },
    },

    // Chip - For badges and status indicators
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
          fontSize: '0.8125rem',
          height: 28,
        },
        // Success state (goals, wins)
        colorSuccess: {
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          color: '#4CAF50',
          border: '1px solid rgba(76, 175, 80, 0.2)',
        },
        // Warning state (cautions)
        colorWarning: {
          backgroundColor: 'rgba(255, 193, 7, 0.1)',
          color: '#FFC107',
          border: '1px solid rgba(255, 193, 7, 0.2)',
        },
        // Error state (defeats, red cards)
        colorError: {
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          color: '#F44336',
          border: '1px solid rgba(244, 67, 54, 0.2)',
        },
        // Info state (general information)
        colorInfo: {
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          color: '#2196F3',
          border: '1px solid rgba(33, 150, 243, 0.2)',
        },
        // Default minimal style
        filled: {
          backgroundColor: 'rgba(40, 40, 40, 0.08)',
          color: '#282828',
          '@media (prefers-color-scheme: dark)': {
            backgroundColor: 'rgba(254, 254, 254, 0.1)',
            color: '#fefefe',
          },
        },
      },
    },

    // Dialog
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          border: '1px solid rgba(0, 0, 0, 0.05)',
          '@media (prefers-color-scheme: dark)': {
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        },
      },
    },

    // Menu
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          '@media (prefers-color-scheme: dark)': {
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          },
        },
      },
    },

    // Avatar
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: '#282828',
          color: '#fefefe',
          '@media (prefers-color-scheme: dark)': {
            backgroundColor: '#fefefe',
            color: '#282828',
          },
        },
      },
    },
  },
});

export default material3Theme;