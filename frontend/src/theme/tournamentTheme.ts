/**
 * Tournament Theme - Material Design 3 Theme Configuration
 * React 18 + TypeScript + Material-UI v5
 */

import { createTheme, Theme, ThemeOptions } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// Material Design 3 Color Tokens
const MD3_COLORS = {
  // Primary Color Palette (Tournament Blue)
  primary: {
    0: '#000000',
    10: '#001321',
    20: '#002538',
    25: '#002f44',
    30: '#003a51',
    35: '#00455f',
    40: '#00516d',
    50: '#00678a',
    60: '#267fa8',
    70: '#4e99c4',
    80: '#74b4e1',
    90: '#9bcfff',
    95: '#cde7ff',
    98: '#eef4ff',
    99: '#f7f9ff',
    100: '#ffffff'
  },

  // Secondary Color Palette (Sport Orange)
  secondary: {
    0: '#000000',
    10: '#2b1700',
    20: '#442800',
    25: '#543000',
    30: '#633a00',
    35: '#734400',
    40: '#834e00',
    50: '#a46300',
    60: '#c67c00',
    70: '#e89611',
    80: '#ffb951',
    90: '#ffdcc2',
    95: '#ffede0',
    98: '#fff8f4',
    99: '#fffbff',
    100: '#ffffff'
  },

  // Tertiary Color Palette (Success Green)
  tertiary: {
    0: '#000000',
    10: '#002110',
    20: '#003919',
    25: '#00431e',
    30: '#004e24',
    35: '#005a2a',
    40: '#006730',
    50: '#008142',
    60: '#229c56',
    70: '#42b86b',
    80: '#5ed581',
    90: '#7bf398',
    95: '#c9f7cd',
    98: '#eafded',
    99: '#f5fef5',
    100: '#ffffff'
  },

  // Error Color Palette
  error: {
    0: '#000000',
    10: '#410e0b',
    20: '#601410',
    25: '#6f1913',
    30: '#7d1f16',
    35: '#8c2519',
    40: '#9a2c1d',
    50: '#b73e26',
    60: '#d55230',
    70: '#f3673a',
    80: '#ff9482',
    90: '#ffbab1',
    95: '#ffede9',
    98: '#fff8f6',
    99: '#fffbff',
    100: '#ffffff'
  },

  // Neutral Color Palette
  neutral: {
    0: '#000000',
    6: '#0f0f0f',
    10: '#1a1a1a',
    12: '#1f1f1f',
    17: '#292929',
    20: '#313131',
    22: '#363636',
    24: '#3a3a3a',
    25: '#3d3d3d',
    30: '#484848',
    35: '#545454',
    40: '#606060',
    50: '#787878',
    60: '#919191',
    70: '#ababab',
    80: '#c7c7c7',
    87: '#dcdcdc',
    90: '#e3e3e3',
    92: '#e8e8e8',
    94: '#eeeeee',
    95: '#f1f1f1',
    96: '#f4f4f4',
    98: '#f9f9f9',
    99: '#fcfcfc',
    100: '#ffffff'
  },

  // Neutral Variant Color Palette
  neutralVariant: {
    0: '#000000',
    10: '#171d22',
    20: '#2c3137',
    25: '#363c42',
    30: '#41474d',
    35: '#4d5359',
    40: '#595f65',
    50: '#71777d',
    60: '#8b9198',
    70: '#a5abb2',
    80: '#c1c7ce',
    90: '#dde3ea',
    95: '#ebf1f8',
    98: '#f3f9ff',
    99: '#f7faff',
    100: '#ffffff'
  }
};

// Surface Colors
const SURFACE_COLORS = {
  surface: MD3_COLORS.neutral[98],
  surfaceDim: MD3_COLORS.neutral[87],
  surfaceBright: MD3_COLORS.neutral[98],
  surfaceContainerLowest: MD3_COLORS.neutral[100],
  surfaceContainerLow: MD3_COLORS.neutral[96],
  surfaceContainer: MD3_COLORS.neutral[94],
  surfaceContainerHigh: MD3_COLORS.neutral[92],
  surfaceContainerHighest: MD3_COLORS.neutral[90]
};

const SURFACE_COLORS_DARK = {
  surface: MD3_COLORS.neutral[6],
  surfaceDim: MD3_COLORS.neutral[6],
  surfaceBright: MD3_COLORS.neutral[24],
  surfaceContainerLowest: MD3_COLORS.neutral[0],
  surfaceContainerLow: MD3_COLORS.neutral[10],
  surfaceContainer: MD3_COLORS.neutral[12],
  surfaceContainerHigh: MD3_COLORS.neutral[17],
  surfaceContainerHighest: MD3_COLORS.neutral[22]
};

// Typography Scale
const TYPOGRAPHY_SCALE = {
  displayLarge: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    fontSize: '3.5rem',
    lineHeight: '4rem',
    letterSpacing: '-0.025em'
  },
  displayMedium: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    fontSize: '2.8125rem',
    lineHeight: '3.25rem',
    letterSpacing: '0em'
  },
  displaySmall: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    fontSize: '2.25rem',
    lineHeight: '2.75rem',
    letterSpacing: '0em'
  },
  headlineLarge: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    fontSize: '2rem',
    lineHeight: '2.5rem',
    letterSpacing: '0em'
  },
  headlineMedium: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    fontSize: '1.75rem',
    lineHeight: '2.25rem',
    letterSpacing: '0em'
  },
  headlineSmall: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    fontSize: '1.5rem',
    lineHeight: '2rem',
    letterSpacing: '0em'
  },
  titleLarge: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 500,
    fontSize: '1.375rem',
    lineHeight: '1.75rem',
    letterSpacing: '0em'
  },
  titleMedium: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 500,
    fontSize: '1rem',
    lineHeight: '1.5rem',
    letterSpacing: '0.009375em'
  },
  titleSmall: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    letterSpacing: '0.00625em'
  },
  bodyLarge: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    fontSize: '1rem',
    lineHeight: '1.5rem',
    letterSpacing: '0.009375em'
  },
  bodyMedium: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    letterSpacing: '0.0179em'
  },
  bodySmall: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    fontSize: '0.75rem',
    lineHeight: '1rem',
    letterSpacing: '0.033em'
  },
  labelLarge: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    letterSpacing: '0.00625em'
  },
  labelMedium: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 500,
    fontSize: '0.75rem',
    lineHeight: '1rem',
    letterSpacing: '0.033em'
  },
  labelSmall: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 500,
    fontSize: '0.6875rem',
    lineHeight: '1rem',
    letterSpacing: '0.033em'
  }
};

// Common Theme Options
const getCommonThemeOptions = (): ThemeOptions => ({
  shape: {
    borderRadius: 16 // Material Design 3 rounded corners
  },

  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    // Material Design 3 Typography Scale
    h1: TYPOGRAPHY_SCALE.displayLarge,
    h2: TYPOGRAPHY_SCALE.displayMedium,
    h3: TYPOGRAPHY_SCALE.displaySmall,
    h4: TYPOGRAPHY_SCALE.headlineLarge,
    h5: TYPOGRAPHY_SCALE.headlineMedium,
    h6: TYPOGRAPHY_SCALE.headlineSmall,
    subtitle1: TYPOGRAPHY_SCALE.titleLarge,
    subtitle2: TYPOGRAPHY_SCALE.titleMedium,
    body1: TYPOGRAPHY_SCALE.bodyLarge,
    body2: TYPOGRAPHY_SCALE.bodyMedium,
    caption: TYPOGRAPHY_SCALE.bodySmall,
    button: TYPOGRAPHY_SCALE.labelLarge,
    overline: TYPOGRAPHY_SCALE.labelSmall
  },

  shadows: [
    'none',
    // Elevation 1
    '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
    // Elevation 2
    '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
    // Elevation 3
    '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.3)',
    // Elevation 4
    '0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px 0px rgba(0, 0, 0, 0.3)',
    // Elevation 5
    '0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px 0px rgba(0, 0, 0, 0.3)',
    // Additional elevations...
    ...Array(19).fill('0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px 0px rgba(0, 0, 0, 0.3)')
  ]
});

// Light Theme
export const lightTheme: Theme = createTheme({
  ...getCommonThemeOptions(),
  palette: {
    mode: 'light',
    primary: {
      main: MD3_COLORS.primary[40],
      light: MD3_COLORS.primary[80],
      dark: MD3_COLORS.primary[20],
      contrastText: MD3_COLORS.primary[100]
    },
    secondary: {
      main: MD3_COLORS.secondary[40],
      light: MD3_COLORS.secondary[80],
      dark: MD3_COLORS.secondary[20],
      contrastText: MD3_COLORS.secondary[100]
    },
    tertiary: {
      main: MD3_COLORS.tertiary[40],
      light: MD3_COLORS.tertiary[80],
      dark: MD3_COLORS.tertiary[20],
      contrastText: MD3_COLORS.tertiary[100]
    },
    error: {
      main: MD3_COLORS.error[40],
      light: MD3_COLORS.error[80],
      dark: MD3_COLORS.error[20],
      contrastText: MD3_COLORS.error[100]
    },
    warning: {
      main: MD3_COLORS.secondary[50],
      light: MD3_COLORS.secondary[80],
      dark: MD3_COLORS.secondary[30],
      contrastText: MD3_COLORS.secondary[100]
    },
    info: {
      main: MD3_COLORS.primary[50],
      light: MD3_COLORS.primary[80],
      dark: MD3_COLORS.primary[30],
      contrastText: MD3_COLORS.primary[100]
    },
    success: {
      main: MD3_COLORS.tertiary[40],
      light: MD3_COLORS.tertiary[80],
      dark: MD3_COLORS.tertiary[20],
      contrastText: MD3_COLORS.tertiary[100]
    },
    background: {
      default: SURFACE_COLORS.surface,
      paper: SURFACE_COLORS.surfaceContainer
    },
    text: {
      primary: MD3_COLORS.neutral[10],
      secondary: MD3_COLORS.neutral[30],
      disabled: alpha(MD3_COLORS.neutral[10], 0.38)
    },
    divider: alpha(MD3_COLORS.neutral[10], 0.12),
    // Material Design 3 Surface Colors
    surface: {
      main: SURFACE_COLORS.surface,
      dim: SURFACE_COLORS.surfaceDim,
      bright: SURFACE_COLORS.surfaceBright,
      containerLowest: SURFACE_COLORS.surfaceContainerLowest,
      containerLow: SURFACE_COLORS.surfaceContainerLow,
      container: SURFACE_COLORS.surfaceContainer,
      containerHigh: SURFACE_COLORS.surfaceContainerHigh,
      containerHighest: SURFACE_COLORS.surfaceContainerHighest
    }
  }
});

// Dark Theme
export const darkTheme: Theme = createTheme({
  ...getCommonThemeOptions(),
  palette: {
    mode: 'dark',
    primary: {
      main: MD3_COLORS.primary[80],
      light: MD3_COLORS.primary[90],
      dark: MD3_COLORS.primary[30],
      contrastText: MD3_COLORS.primary[20]
    },
    secondary: {
      main: MD3_COLORS.secondary[80],
      light: MD3_COLORS.secondary[90],
      dark: MD3_COLORS.secondary[30],
      contrastText: MD3_COLORS.secondary[20]
    },
    tertiary: {
      main: MD3_COLORS.tertiary[80],
      light: MD3_COLORS.tertiary[90],
      dark: MD3_COLORS.tertiary[30],
      contrastText: MD3_COLORS.tertiary[20]
    },
    error: {
      main: MD3_COLORS.error[80],
      light: MD3_COLORS.error[90],
      dark: MD3_COLORS.error[30],
      contrastText: MD3_COLORS.error[20]
    },
    warning: {
      main: MD3_COLORS.secondary[80],
      light: MD3_COLORS.secondary[90],
      dark: MD3_COLORS.secondary[30],
      contrastText: MD3_COLORS.secondary[20]
    },
    info: {
      main: MD3_COLORS.primary[80],
      light: MD3_COLORS.primary[90],
      dark: MD3_COLORS.primary[30],
      contrastText: MD3_COLORS.primary[20]
    },
    success: {
      main: MD3_COLORS.tertiary[80],
      light: MD3_COLORS.tertiary[90],
      dark: MD3_COLORS.tertiary[30],
      contrastText: MD3_COLORS.tertiary[20]
    },
    background: {
      default: SURFACE_COLORS_DARK.surface,
      paper: SURFACE_COLORS_DARK.surfaceContainer
    },
    text: {
      primary: MD3_COLORS.neutral[90],
      secondary: MD3_COLORS.neutral[80],
      disabled: alpha(MD3_COLORS.neutral[90], 0.38)
    },
    divider: alpha(MD3_COLORS.neutral[90], 0.12),
    // Material Design 3 Surface Colors (Dark)
    surface: {
      main: SURFACE_COLORS_DARK.surface,
      dim: SURFACE_COLORS_DARK.surfaceDim,
      bright: SURFACE_COLORS_DARK.surfaceBright,
      containerLowest: SURFACE_COLORS_DARK.surfaceContainerLowest,
      containerLow: SURFACE_COLORS_DARK.surfaceContainerLow,
      container: SURFACE_COLORS_DARK.surfaceContainer,
      containerHigh: SURFACE_COLORS_DARK.surfaceContainerHigh,
      containerHighest: SURFACE_COLORS_DARK.surfaceContainerHighest
    }
  }
});

// Component Overrides
const getComponentOverrides = (theme: Theme) => ({
  // Material Design 3 Card
  MuiCard: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[1],
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: theme.shadows[2],
          transform: 'translateY(-2px)'
        }
      }
    }
  },

  // Material Design 3 Button
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: theme.shape.borderRadius * 2,
        textTransform: 'none',
        fontWeight: 500,
        fontSize: '0.875rem',
        padding: '12px 24px',
        minHeight: '48px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'scale(1.02)'
        }
      },
      contained: {
        boxShadow: 'none',
        '&:hover': {
          boxShadow: theme.shadows[2]
        }
      }
    }
  },

  // Material Design 3 FAB
  MuiFab: {
    styleOverrides: {
      root: {
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[3],
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: 'scale(1.05)'
        }
      }
    }
  },

  // Material Design 3 Switch
  MuiSwitch: {
    styleOverrides: {
      root: {
        width: 52,
        height: 32,
        padding: 0,
        '& .MuiSwitch-switchBase': {
          padding: 0,
          margin: 2,
          transitionDuration: '300ms',
          '&.Mui-checked': {
            transform: 'translateX(20px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
              backgroundColor: theme.palette.primary.main,
              opacity: 1,
              border: 0
            }
          }
        },
        '& .MuiSwitch-thumb': {
          boxSizing: 'border-box',
          width: 28,
          height: 28,
          borderRadius: 14
        },
        '& .MuiSwitch-track': {
          borderRadius: 16,
          backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
          opacity: 1,
          transition: theme.transitions.create(['background-color'])
        }
      }
    }
  },

  // Material Design 3 Modal
  MuiModal: {
    styleOverrides: {
      backdrop: {
        backgroundColor: alpha(theme.palette.common.black, 0.5),
        backdropFilter: 'blur(10px)'
      }
    }
  },

  // Material Design 3 Paper
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        borderRadius: theme.shape.borderRadius,
        border: `1px solid ${alpha(theme.palette.divider, 0.12)}`
      }
    }
  }
});

// Apply component overrides
lightTheme.components = getComponentOverrides(lightTheme);
darkTheme.components = getComponentOverrides(darkTheme);

// Default export (dark theme for tournament dashboard)
export default darkTheme;

// Theme utilities
export const getTheme = (mode: 'light' | 'dark'): Theme => {
  return mode === 'light' ? lightTheme : darkTheme;
};

export const MD3_COLOR_TOKENS = MD3_COLORS;
export const SURFACE_COLOR_TOKENS = { light: SURFACE_COLORS, dark: SURFACE_COLORS_DARK };