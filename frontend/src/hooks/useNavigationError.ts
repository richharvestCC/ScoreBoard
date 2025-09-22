import { useCallback } from 'react';
import { log } from '../services/logger';
import { globalNavigateToAuth, globalNavigateToHome } from '../contexts/NavigationContext';

interface NavigationError {
  message: string;
  path?: string;
  options?: any;
  timestamp: number;
}

export function useNavigationError() {
  const handleNavigationError = useCallback((error: NavigationError) => {
    log.error('Navigation Error', 'navigation', {
      error: error.message,
      targetPath: error.path,
      options: error.options,
      timestamp: error.timestamp,
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // Implement fallback navigation based on error type
    if (error.message.includes('auth') || error.path?.includes('/auth')) {
      // For auth-related navigation errors, try global auth navigation
      try {
        globalNavigateToAuth();
      } catch (fallbackError) {
        log.error('Fallback auth navigation failed', 'navigation', {
          originalError: error.message,
          fallbackError: (fallbackError as Error).message
        });
      }
    } else {
      // For other errors, try navigating to home
      try {
        globalNavigateToHome();
      } catch (fallbackError) {
        log.error('Fallback home navigation failed', 'navigation', {
          originalError: error.message,
          fallbackError: (fallbackError as Error).message
        });
      }
    }
  }, []);

  const safeNavigate = useCallback((
    navigateFunction: () => void,
    errorContext: { path?: string; options?: any }
  ) => {
    try {
      navigateFunction();
    } catch (error) {
      handleNavigationError({
        message: (error as Error).message,
        path: errorContext.path,
        options: errorContext.options,
        timestamp: Date.now()
      });
    }
  }, [handleNavigationError]);

  return {
    handleNavigationError,
    safeNavigate
  };
}