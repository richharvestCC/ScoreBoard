// Mock auth hook for UI development - bypasses authentication
// This file provides mock authentication data so UI components work properly
// without requiring actual login

export const useAuth = () => {
  // Mock user data for UI development
  const mockUser = {
    user_id: 'ui_dev_user',
    name: 'UI 개발자',
    email: 'ui.dev@scoreboard.local',
    role: 'admin', // Admin role to access all features
  };

  return {
    // State
    user: mockUser,
    isAuthenticated: true, // Always authenticated for UI development
    isLoading: false,
    error: null,

    // Actions - mock functions that don't do anything
    login: () => console.log('Mock login - bypassed for UI development'),
    register: () => console.log('Mock register - bypassed for UI development'),
    logout: () => console.log('Mock logout - bypassed for UI development'),
    clearError: () => {},

    // Query states
    isLoginLoading: false,
    isRegisterLoading: false,
    isLogoutLoading: false,
    isProfileLoading: false,

    // Profile data
    profile: mockUser,
    refetchProfile: () => Promise.resolve({ data: { data: { user: mockUser } } }),
  };
};

// Export as default for compatibility
export default useAuth;