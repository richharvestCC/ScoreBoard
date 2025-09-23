import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { authAPI } from '../services/api';
import useAuthStore, { User } from '../stores/authStore';
import { useEffect } from 'react';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  name: string;
}

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

interface AuthHookReturn {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => void;
  register: (userData: RegisterData) => void;
  logout: () => void;
  clearError: () => void;

  // Query states
  isLoginLoading: boolean;
  isRegisterLoading: boolean;
  isLogoutLoading: boolean;
  isProfileLoading: boolean;

  // Profile data
  profile: User | undefined;
  refetchProfile: () => void;
}

export const useAuth = (): AuthHookReturn => {
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
    onError: (error: AxiosError<ApiError>) => {
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
    onError: (error: AxiosError<ApiError>) => {
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

  // Get profile query with React Query v5 pattern
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: authAPI.getProfile,
    enabled: getters.isLoggedIn(),
    retry: false,
  });

  // Handle profile query success/error in useEffect (React Query v5 pattern)
  useEffect(() => {
    if (profileQuery.data) {
      const user = profileQuery.data.data.data;
      useAuthStore.getState().setUser(user);
    }
    if (profileQuery.error) {
      logout();
    }
  }, [profileQuery.data, profileQuery.error, logout]);

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
    profile: profileQuery.data?.data?.data,
    refetchProfile: profileQuery.refetch,
  };
};