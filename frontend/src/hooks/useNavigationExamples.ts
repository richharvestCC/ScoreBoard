/**
 * Navigation Hook Usage Examples
 *
 * This file demonstrates how to use the improved navigation system
 * throughout the application instead of window.location.href
 */

import { useNavigation } from '../contexts/NavigationContext';

// Example 1: Basic navigation in a component
export function ExampleComponent() {
  const { navigate, navigateToAuth } = useNavigation();

  const handleNavigateToClubs = () => {
    navigate('/clubs');
  };

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Navigate to auth page
    navigateToAuth();
  };

  // Component JSX would go here...
  return null;
}

// Example 2: Navigation with state
export function ExampleWithState() {
  const { navigate } = useNavigation();

  const handleNavigateWithState = () => {
    navigate('/clubs', {
      state: {
        fromDashboard: true,
        message: 'Welcome to clubs!'
      }
    });
  };

  return null;
}

// Example 3: Conditional navigation
export function ExampleConditionalNavigation() {
  const { navigate, navigateToAuth } = useNavigation();

  const handleProtectedAction = async () => {
    try {
      // Some API call that might fail
      const response = await fetch('/api/protected-action');

      if (response.status === 401) {
        // Token expired, redirect to auth
        navigateToAuth();
        return;
      }

      if (response.ok) {
        // Success, navigate to success page
        navigate('/success');
      }
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  return null;
}

// Example 4: Replace vs Push navigation
export function ExampleNavigationTypes() {
  const { navigate, navigateWithReplace } = useNavigation();

  const handlePushNavigation = () => {
    // Adds to history stack (user can go back)
    navigate('/new-page');
  };

  const handleReplaceNavigation = () => {
    // Replaces current page in history (user cannot go back)
    navigateWithReplace('/new-page');
  };

  return null;
}

// Example 5: Custom hook for common navigation patterns
export function useCommonNavigation() {
  const { navigate, navigateToAuth, navigateToHome } = useNavigation();

  const navigateToClubDetail = (clubId: number) => {
    navigate(`/clubs/${clubId}`);
  };

  const navigateToMatchLive = (matchId: number) => {
    navigate(`/matches/${matchId}/live`);
  };

  const navigateToTournamentDetail = (tournamentId: number) => {
    navigate(`/tournaments/${tournamentId}`);
  };

  const handleAuthError = () => {
    // Clear any auth data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Navigate to auth with a message
    navigateToAuth();
  };

  const navigateBack = () => {
    // Use browser's back functionality
    window.history.back();
  };

  return {
    navigateToClubDetail,
    navigateToMatchLive,
    navigateToTournamentDetail,
    navigateToAuth,
    navigateToHome,
    handleAuthError,
    navigateBack,
  };
}

// Example 6: Migration from old patterns
export function MigrationExamples() {
  const { navigate, navigateWithReplace } = useNavigation();

  // ❌ OLD WAY - Don't use these anymore
  const oldWayExamples = () => {
    // window.location.href = '/clubs';  // DON'T USE
    // window.location.replace('/auth'); // DON'T USE

    // const event = new CustomEvent('forceNavigate', {
    //   detail: { path: '/clubs' }
    // });
    // window.dispatchEvent(event);  // DON'T USE
  };

  // ✅ NEW WAY - Use these instead
  const newWayExamples = () => {
    // Instead of window.location.href = '/clubs'
    navigate('/clubs');

    // Instead of window.location.replace('/auth')
    navigateWithReplace('/auth');

    // For programmatic navigation from anywhere in the app
    // Use the global functions in NavigationContext
  };

  return null;
}