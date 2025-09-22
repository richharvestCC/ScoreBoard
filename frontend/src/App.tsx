import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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

// Hooks
import useAuthStore from './stores/authStore';

// Navigation handler component to handle API redirects
function NavigationHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleForceNavigate = (event: CustomEvent) => {
      navigate(event.detail.path);
    };

    window.addEventListener('forceNavigate', handleForceNavigate as EventListener);

    return () => {
      window.removeEventListener('forceNavigate', handleForceNavigate as EventListener);
    };
  }, [navigate]);

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
          <NavigationHandler />
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

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
