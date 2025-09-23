import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';

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

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const { initializeAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <NavigationProvider>
            <NavigationSetup />
            <Box sx={{ flexGrow: 1 }}>
            <Header />
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

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </Box>
          </NavigationProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
