import { createTheme } from '@mui/material/styles';

// Material 3 Design Theme for Football/Futsal Platform
// Minimal color approach with vivid colors only for badges/icons

const material3Theme = createTheme({
  cssVariables: true,

  colorSchemes: {
    light: {
      palette: {
        mode: 'light',
        // Complete Material Design 3 Color Palette
        primary: {
          main: '#424242',
          light: '#616161',
          dark: '#303030',
          contrastText: '#ffffff',
          50: '#f5f5f5',
          100: '#e0e0e0',
          200: '#bdbdbd',
          300: '#9e9e9e',
          400: '#757575',
          500: '#616161',
          600: '#424242',
          700: '#303030',
          800: '#212121',
          900: '#282828',
        },
        secondary: {
          main: '#fd7521',
          light: '#ff9551',
          dark: '#e6690f',
          contrastText: '#ffffff',
          50: '#fff9f5',
          100: '#ffede0',
          200: '#ffd9bf',
          300: '#ffc199',
          400: '#ffa366',
          500: '#ff8533',
          600: '#fd7521', // 기준색
          700: '#e6690f',
          800: '#cc5d0d',
          900: '#b8520a',
        },
        success: {
          main: '#75cf49',
          light: '#8bd355',
          dark: '#5db134',
          contrastText: '#ffffff',
          50: '#f0f9ec',
          100: '#dcf2d1',
          200: '#c2e8a8',
          300: '#a3dc79',
          400: '#8bd355',
          500: '#7dd44a',
          600: '#75cf49', // 기준색 Green for goals/wins
          700: '#5db134',
          800: '#519f2b',
          900: '#458d22',
        },
        warning: {
          main: '#ffbe4c',
          light: '#ffc966',
          dark: '#ff9800',
          contrastText: '#000000',
          50: '#fffbf0',
          100: '#fff4d9',
          200: '#ffe8b3',
          300: '#ffd980',
          400: '#ffc966',
          500: '#ffc452',
          600: '#ffbe4c', // 기준색 Amber for cautions
          700: '#ff9800',
          800: '#f57c00',
          900: '#e65100',
        },
        error: {
          main: '#d72446',
          light: '#ea7890',
          dark: '#b71c3c',
          contrastText: '#ffffff',
          50: '#fdf2f4',
          100: '#fce4e8',
          200: '#f8c9d1',
          300: '#f2a3b3',
          400: '#ea7890',
          500: '#e0336b',
          600: '#d72446', // 기준색 Red for defeats/errors
          700: '#b71c3c',
          800: '#a01936',
          900: '#8e162e',
        },
        info: {
          main: '#308ae1',
          light: '#5ba4f5',
          dark: '#2470c7',
          contrastText: '#ffffff',
          50: '#f0f7ff',
          100: '#dceeff',
          200: '#b9ddff',
          300: '#8cc7ff',
          400: '#5ba4f5',
          500: '#3d96ea',
          600: '#308ae1', // 기준색 Blue for information
          700: '#2470c7',
          800: '#1e63ba',
          900: '#1856ad',
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
          secondary: '#282828',
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
          main: '#fd7521',
          light: '#ff9551',
          dark: '#e6690f',
          contrastText: '#ffffff',
        },
        // Same vivid colors for badges/icons
        success: {
          main: '#75cf49',
          light: '#8bd355',
          dark: '#5db134',
          contrastText: '#ffffff',
        },
        warning: {
          main: '#ffbe4c',
          light: '#ffc966',
          dark: '#ff9800',
          contrastText: '#000000',
        },
        error: {
          main: '#d72446',
          light: '#ea7890',
          dark: '#b71c3c',
          contrastText: '#ffffff',
        },
        info: {
          main: '#308ae1',
          light: '#5ba4f5',
          dark: '#2470c7',
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
    fontFamily: '"Apple SD Gothic Neo", "Pretendard", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
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
      textAlign: 'left',
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
      textAlign: 'left',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.4,
    },
  },

  // Material 3 shape system
  shape: {
    borderRadius: 8,
  },

  spacing: 8,

  components: {
    // Global baseline
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: '"Apple SD Gothic Neo", "Pretendard", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
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
          borderRadius: 8,
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
          borderRadius: 8,
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
            borderRadius: 8,
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
          borderRadius: 8,
          fontWeight: 500,
          fontSize: '0.8125rem',
          height: 28,
        },
        // Success state (goals, wins)
        colorSuccess: {
          backgroundColor: 'rgba(117, 207, 73, 0.1)',
          color: '#75cf49',
          border: '1px solid rgba(117, 207, 73, 0.2)',
        },
        // Warning state (cautions)
        colorWarning: {
          backgroundColor: 'rgba(255, 190, 76, 0.1)',
          color: '#FFBE4C',
          border: '1px solid rgba(255, 190, 76, 0.2)',
        },
        // Error state (defeats, red cards)
        colorError: {
          backgroundColor: 'rgba(215, 36, 70, 0.1)',
          color: '#D72446',
          border: '1px solid rgba(215, 36, 70, 0.2)',
        },
        // Info state (general information)
        colorInfo: {
          backgroundColor: 'rgba(48, 138, 225, 0.1)',
          color: '#308AE1',
          border: '1px solid rgba(48, 138, 225, 0.2)',
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
          borderRadius: 8,
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