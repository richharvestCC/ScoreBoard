import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, useMediaQuery, useTheme } from '@mui/material';
import material3Theme from './theme/material3Theme';

// Components
import Header from './components/layout/Header';
// import ProtectedRoute from './components/ProtectedRoute'; // BYPASSED FOR UI DEVELOPMENT

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
import ThemeVisualization from './pages/ThemeVisualization';

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
  const { initializeAuth } = useAuthStore();
  const theme = useTheme();

  // 새로운 브레이크포인트 기준
  const isMobile = useMediaQuery('(max-width: 767.98px)'); // 모바일: ~767.98px
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023.98px)'); // 태블릿: 768px~1023.98px
  const isDesktop = useMediaQuery('(min-width: 1024px) and (max-width: 1279px)'); // 데스크톱: 1024px~1279px
  const isLargeDesktop = useMediaQuery('(min-width: 1280px) and (max-width: 1440px)'); // 대형: 1280px~1440px
  const isExtraLarge = useMediaQuery('(min-width: 1441px)'); // 초대형: 1441px+

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // 새로운 컨테이너 최대 너비 기준
  const getContainerMaxWidth = () => {
    if (isMobile) return '100%';
    if (isTablet) return '100%';
    if (isDesktop) return '1200px';
    if (isLargeDesktop) return '1320px';
    if (isExtraLarge) return '1400px';
    return '1200px'; // 기본값
  };

  // 새로운 기준에 따른 반응형 패딩
  const getResponsivePadding = () => {
    if (isMobile) return theme.spacing(1, 2); // 모바일: 8px vertical, 16px horizontal
    if (isTablet) return theme.spacing(2, 3); // 태블릿: 16px vertical, 24px horizontal
    if (isDesktop) return theme.spacing(3); // 데스크톱: 24px all around
    if (isLargeDesktop) return theme.spacing(3, 4); // 대형: 24px vertical, 32px horizontal
    if (isExtraLarge) return theme.spacing(4); // 초대형: 32px all around
    return theme.spacing(3); // 기본값
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
            // 새로운 반응형 레이아웃 조정
            '@media (max-width: 767.98px)': {
              padding: theme.spacing(1, 2),
            },
            '@media (min-width: 768px) and (max-width: 1023.98px)': {
              padding: theme.spacing(2, 3),
            },
            '@media (min-width: 1024px) and (max-width: 1279px)': {
              padding: theme.spacing(3),
            },
            '@media (min-width: 1280px) and (max-width: 1440px)': {
              padding: theme.spacing(3, 4),
            },
            '@media (min-width: 1441px)': {
              padding: theme.spacing(4),
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
              // 새로운 기준에 따른 반응형 상단 마진
              '@media (max-width: 767.98px)': {
                mt: theme.spacing(1),
              },
              '@media (min-width: 768px) and (max-width: 1023.98px)': {
                mt: theme.spacing(2),
              },
              '@media (min-width: 1024px)': {
                mt: theme.spacing(3),
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
                <Route path="/tournaments" element={<TournamentList />} />
                <Route path="/tournaments/:id" element={<TournamentDetail />} />
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
