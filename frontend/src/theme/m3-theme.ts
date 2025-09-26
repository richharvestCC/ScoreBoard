import { createTheme } from '@mui/material/styles';

// Material Design 3 aligned dark theme with brand guardrails
const m3Theme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#0a0a0a', paper: '#1a1a1a' },
    text: { primary: '#ffffff', secondary: '#b0b0b0', disabled: '#6e6e6e' },
    primary: { main: '#2a82da' },
    success: { main: '#4caf50' },
    error: { main: '#f44336' },
    warning: { main: '#ff9800' },
    info: { main: '#33c2ff' },
    divider: '#2a2a2a',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Roboto","Noto Sans KR","Helvetica","Arial",sans-serif',
    h4: { fontWeight: 600, letterSpacing: '-0.4px' },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          border: '1px solid #2a2a2a',
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, padding: '6px 16px' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, background: '#1a1a1a', border: '1px solid #2a2a2a' },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiDivider: { styleOverrides: { root: { borderColor: '#2a2a2a' } } },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { border: '1px solid #2a2a2a', backgroundColor: '#111111' },
      },
    },
  },
});

export default m3Theme;

