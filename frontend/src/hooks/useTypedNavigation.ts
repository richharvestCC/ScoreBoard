import { useNavigate, NavigateOptions } from 'react-router-dom';
import { useCallback } from 'react';

// Define valid route paths for type safety
export type AppRoutes =
  | '/'
  | '/auth'
  | '/dashboard'
  | '/profile'
  | '/clubs'
  | '/clubs/create'
  | `/clubs/${string}`
  | `/clubs/${string}/edit`
  | '/matches'
  | '/matches/create'
  | `/matches/${string}`
  | `/matches/${string}/edit`
  | `/matches/${string}/live`
  | '/tournaments'
  | '/tournaments/create'
  | `/tournaments/${string}`
  | `/tournaments/${string}/manage`;

// Navigation methods for type safety
export type NavigationMethod = 'push' | 'replace' | 'back' | 'forward';

// Navigation options interface
export interface TypedNavigationOptions extends NavigateOptions {
  method?: Exclude<NavigationMethod, 'back' | 'forward'>;
}

// Enhanced navigation hook with type safety and logging
export function useTypedNavigation() {
  const navigate = useNavigate();

  // Type-safe navigation function
  const navigateTo = useCallback((
    path: AppRoutes | string,
    options: TypedNavigationOptions = {}
  ) => {
    const { method = 'push', ...navigateOptions } = options;

    try {
      // Log navigation for debugging (in development)
      if (process.env.NODE_ENV === 'development') {
        console.log(`🧭 Navigation: ${method} → ${path}`);
      }

      // Handle different navigation methods
      switch (method) {
        case 'replace':
          navigate(path, { replace: true, ...navigateOptions });
          break;
        case 'push':
        default:
          navigate(path, navigateOptions);
          break;
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to home page on navigation error
      navigate('/');
    }
  }, [navigate]);

  // Navigation history methods
  const goBack = useCallback(() => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🧭 Navigation: back');
      }
      navigate(-1);
    } catch (error) {
      console.error('Navigation back error:', error);
      navigate('/');
    }
  }, [navigate]);

  const goForward = useCallback(() => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🧭 Navigation: forward');
      }
      navigate(1);
    } catch (error) {
      console.error('Navigation forward error:', error);
    }
  }, [navigate]);

  // Specific navigation helpers for common routes
  const navigateToHome = useCallback(() => navigateTo('/'), [navigateTo]);
  const navigateToDashboard = useCallback(() => navigateTo('/dashboard'), [navigateTo]);
  const navigateToAuth = useCallback(() => navigateTo('/auth'), [navigateTo]);
  const navigateToProfile = useCallback(() => navigateTo('/profile'), [navigateTo]);

  // Club navigation helpers
  const navigateToClubs = useCallback(() => navigateTo('/clubs'), [navigateTo]);
  const navigateToClub = useCallback((id: string | number) =>
    navigateTo(`/clubs/${id}`), [navigateTo]);
  const navigateToClubEdit = useCallback((id: string | number) =>
    navigateTo(`/clubs/${id}/edit`), [navigateTo]);
  const navigateToCreateClub = useCallback(() => navigateTo('/clubs/create'), [navigateTo]);

  // Match navigation helpers
  const navigateToMatches = useCallback(() => navigateTo('/matches'), [navigateTo]);
  const navigateToMatch = useCallback((id: string | number) =>
    navigateTo(`/matches/${id}`), [navigateTo]);
  const navigateToMatchEdit = useCallback((id: string | number) =>
    navigateTo(`/matches/${id}/edit`), [navigateTo]);
  const navigateToLiveScoring = useCallback((id: string | number) =>
    navigateTo(`/matches/${id}/live`), [navigateTo]);
  const navigateToCreateMatch = useCallback(() => navigateTo('/matches/create'), [navigateTo]);

  // Tournament navigation helpers
  const navigateToTournaments = useCallback(() => navigateTo('/tournaments'), [navigateTo]);
  const navigateToTournament = useCallback((id: string | number) =>
    navigateTo(`/tournaments/${id}`), [navigateTo]);
  const navigateToTournamentManage = useCallback((id: string | number) =>
    navigateTo(`/tournaments/${id}/manage`), [navigateTo]);
  const navigateToCreateTournament = useCallback(() => navigateTo('/tournaments/create'), [navigateTo]);

  // Navigation state helpers
  const isValidRoute = useCallback((path: string): path is AppRoutes => {
    // Basic validation for known routes
    const validPaths = [
      '/', '/auth', '/dashboard', '/profile',
      '/clubs', '/clubs/create',
      '/matches', '/matches/create',
      '/tournaments', '/tournaments/create'
    ];

    // Check exact matches
    if (validPaths.includes(path)) return true;

    // Check dynamic routes
    if (path.match(/^\/clubs\/[^/]+$/)) return true;
    if (path.match(/^\/clubs\/[^/]+\/edit$/)) return true;
    if (path.match(/^\/matches\/[^/]+$/)) return true;
    if (path.match(/^\/matches\/[^/]+\/edit$/)) return true;
    if (path.match(/^\/matches\/[^/]+\/live$/)) return true;
    if (path.match(/^\/tournaments\/[^/]+$/)) return true;
    if (path.match(/^\/tournaments\/[^/]+\/manage$/)) return true;

    return false;
  }, []);

  return {
    // Core navigation
    navigateTo,
    goBack,
    goForward,

    // Common routes
    navigateToHome,
    navigateToDashboard,
    navigateToAuth,
    navigateToProfile,

    // Club routes
    navigateToClubs,
    navigateToClub,
    navigateToClubEdit,
    navigateToCreateClub,

    // Match routes
    navigateToMatches,
    navigateToMatch,
    navigateToMatchEdit,
    navigateToLiveScoring,
    navigateToCreateMatch,

    // Tournament routes
    navigateToTournaments,
    navigateToTournament,
    navigateToTournamentManage,
    navigateToCreateTournament,

    // Utilities
    isValidRoute
  };
}

// Navigation context for global access (optional)
export type NavigationContextType = ReturnType<typeof useTypedNavigation>;

// Error boundary navigation recovery
export function useNavigationErrorRecovery() {
  const { navigateToHome } = useTypedNavigation();

  return useCallback((error: Error) => {
    console.error('Navigation error occurred:', error);

    // Log error details for debugging
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Navigation Error Recovery');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      console.groupEnd();
    }

    // Navigate to safe route
    navigateToHome();
  }, [navigateToHome]);
}