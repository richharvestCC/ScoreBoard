import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, useMediaQuery, useTheme, CircularProgress } from '@mui/material';
import material3Theme from './theme/material3Theme';

// Hooks
import useAuthStore from './stores/authStore';

// Contexts
import { NavigationProvider, useNavigation, setGlobalNavigationCallbacks } from './contexts/NavigationContext';
import { SidebarProvider, useSidebar } from './contexts/SidebarContext';
import { LanguageProvider } from './contexts/LanguageContext';
import ErrorBoundary from './components/common/ErrorBoundary';

// Components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import DocumentTitle from './components/layout/DocumentTitle';
// import ProtectedRoute from './components/ProtectedRoute'; // BYPASSED FOR UI DEVELOPMENT

// Pages - Lazy Loading for Code Splitting
const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const ClubList = React.lazy(() => import('./pages/ClubList'));
const ClubDetail = React.lazy(() => import('./pages/ClubDetail'));
const MatchList = React.lazy(() => import('./pages/MatchList'));
const MatchDetail = React.lazy(() => import('./pages/MatchDetail'));
const LiveScoring = React.lazy(() => import('./pages/LiveScoring'));
const CompetitionList = React.lazy(() => import('./pages/CompetitionList'));
const TournamentDetail = React.lazy(() => import('./pages/TournamentDetail'));
const TemplateManagement = React.lazy(() => import('./pages/TemplateManagement'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const MatchScheduling = React.lazy(() => import('./pages/MatchScheduling'));
// const LiveMatchView = React.lazy(() => import('./pages/LiveMatchView'));
const LiveMatchesPage = React.lazy(() => import('./pages/LiveMatchesPage'));
const LeagueDashboard = React.lazy(() => import('./pages/LeagueDashboard'));
const CompetitionPage = React.lazy(() => import('./pages/CompetitionPage'));
const ThemeVisualization = React.lazy(() => import('./pages/ThemeVisualization'));
const MatchRecord = React.lazy(() => import('./pages/MatchRecord'));
const MatchRecordHome = React.lazy(() => import('./pages/MatchRecordHome'));
const LiveMatchRecord = React.lazy(() => import('./pages/LiveMatchRecord'));
const EventInputPage = React.lazy(() => import('./pages/EventInputPage'));

// Style Guide
const StyleDashRoutes = React.lazy(() => import('./style-dash'));

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
  const { isOpen, isCollapsed, sidebarWidth, collapsedWidth } = useSidebar();
  const isMobile = useMediaQuery('(max-width: 767px)');

  // 새창 체크 (팝업 윈도우인지 확인)
  const isPopupWindow = window.opener !== null;

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {!isPopupWindow && <Sidebar />}
      {!isPopupWindow && <Header />}

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginTop: isPopupWindow ? 0 : '64px', // Account for header height
          minHeight: isPopupWindow ? '100vh' : 'calc(100vh - 64px)',
          backgroundColor: theme.palette.background.default,
          transition: theme.transitions.create('margin-left', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),

          // Responsive padding
          padding: isPopupWindow ? 0 : {
            xs: theme.spacing(1, 2), // Mobile
            sm: theme.spacing(2, 3), // Small tablet
            lg: theme.spacing(3, 4), // Desktop
          },

          // Responsive margin based on sidebar state and screen size
          marginLeft: (() => {
            if (isPopupWindow) return 0; // Popup: no margin
            if (isMobile) return 0; // Mobile: no sidebar offset
            if (!isOpen) return 0; // Sidebar closed: no offset

            // Sidebar is open on tablet/desktop
            if (isCollapsed) return `${collapsedWidth}px`;  // Collapsed mode
            return `${sidebarWidth}px`; // Expanded mode
          })(),
        }}
      >
        <Suspense fallback={
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '300px',
            flexDirection: 'column',
            gap: 2
          }}>
            <CircularProgress size={40} />
            <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>Loading page...</Box>
          </Box>
        }>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<AuthPage />} />

          {/* Protected routes - AUTHENTICATION BYPASSED FOR UI DEVELOPMENT */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/clubs" element={<ClubList />} />
          <Route path="/clubs/:id" element={<ClubDetail />} />
          <Route path="/matches" element={<MatchList />} />
          <Route path="/matches/:id/record" element={<MatchRecord />} />
          <Route path="/record-test" element={<MatchRecord />} />
          <Route path="/admin/match-record" element={<MatchRecordHome />} />
          <Route path="/admin/match-record/live/:matchId?" element={<LiveMatchRecord />} />
          <Route path="/admin/match-record/edit/:matchId?" element={<MatchRecord />} />
          <Route path="/event-input" element={<EventInputPage />} />
          <Route path="/matches/:id/live" element={<LiveScoring />} />
          <Route path="/matches/:id" element={<MatchDetail />} />
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
        </Suspense>
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
        <ErrorBoundary
          showDetails={process.env.NODE_ENV === 'development'}
          onError={(error, errorInfo) => {
            // In production, send to error reporting service
            console.error('Global Error Boundary:', error, errorInfo);
          }}
        >
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
        </ErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
