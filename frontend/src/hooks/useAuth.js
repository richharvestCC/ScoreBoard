import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { authAPI } from '../services/api';
import useAuthStore from '../stores/authStore';

export const useAuth = () => {
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
      const { user, accessToken, refreshToken } = response.data.data;
      setAuth(user, accessToken, refreshToken);
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
      const { user, accessToken, refreshToken } = response.data.data;
      setAuth(user, accessToken, refreshToken);
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

  // Get profile query
  const isLoggedIn = useAuthStore((state) => state.isAuthenticated && !!state.accessToken);
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: authAPI.getProfile,
    enabled: isLoggedIn,
    retry: false,
  });

  // Handle profile query success/error with useEffect (React Query v5 pattern)
  useEffect(() => {
    if (profileQuery.isSuccess && profileQuery.data) {
      const user = profileQuery.data.data.data.user;
      useAuthStore.getState().setUser(user);
    }
  }, [profileQuery.isSuccess, profileQuery.data]);

  useEffect(() => {
    if (profileQuery.isError && isLoggedIn) {
      // Use store's logout directly to avoid stale closure issues
      useAuthStore.getState().logout();
    }
  }, [profileQuery.isError, isLoggedIn]);

  return {
    // State
    user: useAuthStore((state) => state.user),
    isAuthenticated: useAuthStore((state) => state.isAuthenticated),
    isLoading: useAuthStore((state) => state.isLoading),
    error: useAuthStore((state) => state.error),

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