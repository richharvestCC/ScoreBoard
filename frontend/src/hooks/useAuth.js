import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { authAPI } from '../services/api';
import useAuthStore from '../stores/authStore';

export const useAuth = () => {
  // UI DEVELOPMENT MODE - BYPASS AUTHENTICATION
  // Set to false when authentication is needed again
  const UI_DEV_MODE = true;

  // Always call hooks first (React Hooks rule compliance)
  const { setAuth, logout, setLoading, setError, clearError, getters } = useAuthStore();
  const queryClient = useQueryClient();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onMutate: () => {
      setLoading(true);
      clearError();
    },
    onSuccess: (response) => {
      const data = response?.data?.data;
      if (data?.user && data?.accessToken && data?.refreshToken) {
        const { user, accessToken, refreshToken } = data;
        setAuth(user, accessToken, refreshToken);
      }
      setLoading(false);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Login failed';
      setError(message);
      setLoading(false);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onMutate: () => {
      setLoading(true);
      clearError();
    },
    onSuccess: (response) => {
      const data = response?.data?.data;
      if (data?.user && data?.accessToken && data?.refreshToken) {
        const { user, accessToken, refreshToken } = data;
        setAuth(user, accessToken, refreshToken);
      }
      setLoading(false);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Registration failed';
      setError(message);
      setLoading(false);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      logout();
      queryClient.clear(); // Clear all cached queries
    },
    onError: () => {
      // Even if logout API fails, clear local state
      logout();
      queryClient.clear();
    },
  });

  // Get auth store values (call hooks at top level)
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const isLoggedIn = useAuthStore((state) => state.isAuthenticated && !!state.accessToken);

  // Get profile query
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: authAPI.getProfile,
    enabled: isLoggedIn && !UI_DEV_MODE,
    retry: false,
  });

  // Handle profile query success/error with useEffect (React Query v5 pattern)
  useEffect(() => {
    if (!UI_DEV_MODE && profileQuery.isSuccess && profileQuery.data) {
      const user = profileQuery.data?.data?.data?.user;
      if (user) {
        useAuthStore.getState().setUser(user);
      }
    }
  }, [UI_DEV_MODE, profileQuery.isSuccess, profileQuery.data]);

  useEffect(() => {
    if (!UI_DEV_MODE && profileQuery.isError && isLoggedIn) {
      // Use store's logout directly to avoid stale closure issues
      useAuthStore.getState().logout();
    }
  }, [UI_DEV_MODE, profileQuery.isError, isLoggedIn]);

  // UI DEVELOPMENT MODE - Return mock data
  if (UI_DEV_MODE) {
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
  }

  // ORIGINAL AUTHENTICATION CODE
  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    clearError,

    // Query states
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
    isProfileLoading: profileQuery.isLoading,

    // Profile data
    profile: profileQuery.data?.data?.data?.user,
    refetchProfile: profileQuery.refetch,
  };
};