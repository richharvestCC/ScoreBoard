import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, useMediaQuery, useTheme } from '@mui/material';
import material3Theme from './theme/material3Theme';

// Components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import DocumentTitle from './components/layout/DocumentTitle';
// import ProtectedRoute from './components/ProtectedRoute'; // BYPASSED FOR UI DEVELOPMENT

// Pages
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ClubList from './pages/ClubList';
import ClubDetail from './pages/ClubDetail';
import MatchList from './pages/MatchList';
import MatchDetail from './pages/MatchDetail';
import LiveScoring from './pages/LiveScoring';
import CompetitionList from './pages/CompetitionList';
import TournamentDetail from './pages/TournamentDetail';
import TemplateManagement from './pages/TemplateManagement';
import AdminDashboard from './pages/AdminDashboard';
import MatchScheduling from './pages/MatchScheduling';
// import LiveMatchView from './pages/LiveMatchView';
import LiveMatchesPage from './pages/LiveMatchesPage';
import LeagueDashboard from './pages/LeagueDashboard';
import CompetitionPage from './pages/CompetitionPage';
import ThemeVisualization from './pages/ThemeVisualization';

// Style Guide
import StyleDashRoutes from './style-dash';

// Hooks
import useAuthStore from './stores/authStore';

// Contexts
import { NavigationProvider, useNavigation, setGlobalNavigationCallbacks } from './contexts/NavigationContext';
import { SidebarProvider, useSidebar } from './contexts/SidebarContext';
import { LanguageProvider } from './contexts/LanguageContext';

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
  const { initializeAuth } = useAuthStore();
  const theme = useTheme();
  const { isOpen, sidebarWidth } = useSidebar();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Header />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginTop: '64px', // Account for header height
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: theme.palette.background.default,
          transition: theme.transitions.create('margin-left', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),

          // 반응형 패딩 - MUI 객체 형식 사용
          padding: {
            xs: theme.spacing(1, 2),
            sm: theme.spacing(2, 3),
            lg: theme.spacing(3, 4),
          },
          marginLeft: {
            xs: 0,
            md: isMobile ? 0 : (isOpen ? `${sidebarWidth}px` : 0),
          },
        }}
      >
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Protected routes - AUTHENTICATION BYPASSED FOR UI DEVELOPMENT */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/clubs" element={<ClubList />} />
          <Route path="/clubs/:id" element={<ClubDetail />} />
          <Route path="/matches" element={<MatchList />} />
          <Route path="/matches/:id" element={<MatchDetail />} />
          <Route path="/matches/:id/live" element={<LiveScoring />} />
          <Route path="/competitions" element={<CompetitionPage />} />
          <Route path="/competitions" element={<CompetitionList />} />
          <Route path="/tournaments" element={<CompetitionList />} />
          <Route path="/tournaments/:id" element={<TournamentDetail />} />
          <Route path="/competitions/:id" element={<TournamentDetail />} />
          <Route path="/templates" element={<TemplateManagement />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/competitions/:competitionId/scheduling" element={<MatchScheduling />} />
          <Route path="/live" element={<LiveMatchesPage />} />
          <Route path="/leagues/:competitionId/dashboard" element={<LeagueDashboard />} />

          {/* Theme Visualization */}
          <Route path="/theme" element={<ThemeVisualization />} />

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
  );
}

// Main App Component Wrapper
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={material3Theme}>
        <CssBaseline />
        <Router>
          <NavigationProvider>
            <SidebarProvider>
              <LanguageProvider>
                <DocumentTitle />
                <NavigationSetup />
                <AppContent />
              </LanguageProvider>
            </SidebarProvider>
          </NavigationProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
