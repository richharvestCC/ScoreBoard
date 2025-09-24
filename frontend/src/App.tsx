import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, useMediaQuery, useTheme } from '@mui/material';
import material3Theme from './theme/material3Theme';

// Components
import Header from './components/layout/Header';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ClubList from './pages/ClubList';
import ClubDetail from './pages/ClubDetail';
import MatchList from './pages/MatchList';
import MatchDetail from './pages/MatchDetail';
import LiveScoring from './pages/LiveScoring';
import TournamentList from './pages/TournamentList';
import TournamentDetail from './pages/TournamentDetail';
import TemplateManagement from './pages/TemplateManagement';
import AdminDashboard from './pages/AdminDashboard';
import MatchScheduling from './pages/MatchScheduling';
import LiveMatchView from './pages/LiveMatchView';
import LiveMatchesPage from './pages/LiveMatchesPage';
import LeagueDashboard from './pages/LeagueDashboard';
import CompetitionPage from './pages/CompetitionPage';

// Style Guide
import StyleDashRoutes from './style-dash';

// Hooks
import useAuthStore from './stores/authStore';

// Contexts
import { NavigationProvider, useNavigation, setGlobalNavigationCallbacks } from './contexts/NavigationContext';

// Navigation setup component to initialize global navigation callbacks
function NavigationSetup() {
  const navigation = useNavigation();

  useEffect(() => {
    // Set up global navigation callbacks for use in API interceptors and other non-React contexts
    setGlobalNavigationCallbacks({
      navigateToAuth: navigation.navigateToAuth,
      navigateToHome: navigation.navigateToHome,
      navigateWithReplace: navigation.navigateWithReplace,
      navigateWithOptions: navigation.navigateWithOptions,
      navigateBack: navigation.navigateBack,
      navigateForward: navigation.navigateForward,
    });
  }, [navigation]);

  return null;
}

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Use Material 3 theme

// Main App Component with Responsive Layout
function AppContent() {
  const { initializeAuth, isAuthenticated } = useAuthStore();
  const theme = useTheme();

  // Material Design Breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 600px - 900px
  const isDesktop = useMediaQuery(theme.breakpoints.up('md')); // >= 900px
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg')); // >= 1200px

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Responsive container max width based on Material Design guidelines
  const getContainerMaxWidth = () => {
    if (isMobile) return '100%';
    if (isTablet) return 'md';
    if (isLargeScreen) return 'xl';
    return 'lg';
  };

  // Responsive padding based on screen size
  const getResponsivePadding = () => {
    if (isMobile) return theme.spacing(1, 2); // 8px vertical, 16px horizontal
    if (isTablet) return theme.spacing(2, 3); // 16px vertical, 24px horizontal
    return theme.spacing(3); // 24px all around
  };

  return (
    <Router>
      <NavigationProvider>
        <NavigationSetup />
        <Box
          sx={{
            flexGrow: 1,
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            // Material Design responsive spacing
            padding: getResponsivePadding(),
            // Responsive max width
            maxWidth: getContainerMaxWidth(),
            margin: '0 auto',
            // Responsive layout adjustments
            [theme.breakpoints.down('sm')]: {
              padding: theme.spacing(1),
            },
            [theme.breakpoints.up('sm')]: {
              padding: theme.spacing(2),
            },
            [theme.breakpoints.up('md')]: {
              padding: theme.spacing(3),
            },
          }}
        >
          <Header />

          {/* Main Content Area with responsive spacing */}
          <Box
            component="main"
            sx={{
              flex: 1,
              mt: theme.spacing(2),
              // Responsive margin top
              [theme.breakpoints.down('sm')]: {
                mt: theme.spacing(1),
              },
              [theme.breakpoints.up('md')]: {
                mt: theme.spacing(3),
              },
            }}
          >
              <Routes>
                {/* Public routes */}
                <Route
                  path="/auth"
                  element={
                    isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />
                  }
                />

                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/clubs"
                  element={
                    <ProtectedRoute>
                      <ClubList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/clubs/:id"
                  element={
                    <ProtectedRoute>
                      <ClubDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/matches"
                  element={
                    <ProtectedRoute>
                      <MatchList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/matches/:id"
                  element={
                    <ProtectedRoute>
                      <MatchDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/matches/:id/live"
                  element={
                    <ProtectedRoute>
                      <LiveScoring />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/competitions"
                  element={
                    <ProtectedRoute>
                      <CompetitionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tournaments"
                  element={
                    <ProtectedRoute>
                      <TournamentList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tournaments/:id"
                  element={
                    <ProtectedRoute>
                      <TournamentDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/templates"
                  element={
                    <ProtectedRoute>
                      <TemplateManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/competitions/:competitionId/scheduling"
                  element={
                    <ProtectedRoute>
                      <MatchScheduling />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/live"
                  element={
                    <ProtectedRoute>
                      <LiveMatchesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/leagues/:competitionId/dashboard"
                  element={
                    <ProtectedRoute>
                      <LeagueDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Style Guide Dashboard */}
                <Route
                  path="/style-dash/*"
                  element={<StyleDashRoutes />}
                />

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
          </Box>
        </NavigationProvider>
      </Router>
  );
}

// Main App Component Wrapper
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={material3Theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
