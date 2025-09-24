import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setAuth: (user, accessToken, refreshToken) => {
        // 원자적 작업으로 경쟁 상태 방지
        try {
          // 먼저 상태를 업데이트 (localStorage 실패해도 앱은 작동)
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            error: null,
          });

          // 그 다음 localStorage에 저장
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
        } catch (error) {
          console.error('Failed to save tokens to localStorage:', error);
          // localStorage 실패해도 메모리 상태는 유지
        }
      },

      setUser: (user) => set({ user }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      logout: () => {
        // 원자적 작업으로 경쟁 상태 방지
        try {
          // 먼저 상태를 업데이트 (즉시 로그아웃 상태로)
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          });

          // 그 다음 localStorage에서 제거
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        } catch (error) {
          console.error('Failed to remove tokens from localStorage:', error);
          // localStorage 실패해도 메모리 상태는 이미 로그아웃됨
        }
      },

      // Initialize auth state from localStorage
      initializeAuth: () => {
        try {
          const accessToken = localStorage.getItem('accessToken');
          const refreshToken = localStorage.getItem('refreshToken');

          if (accessToken && refreshToken) {
            set({
              accessToken,
              refreshToken,
              isAuthenticated: true,
            });
          }
        } catch (error) {
          console.error('Failed to initialize auth from localStorage:', error);
          // localStorage 실패 시 초기 상태 유지
        }
      },

      // Helper getters
      getters: {
        isLoggedIn: () => get().isAuthenticated && get().accessToken,
        getUser: () => get().user,
        getToken: () => get().accessToken,
      },
    }),
    {
      name: 'auth-storage',
      // Only persist essential data
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;