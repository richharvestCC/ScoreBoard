import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useNavigate, NavigateFunction, NavigateOptions, useLocation } from 'react-router-dom';
import { log } from '../services/logger';

interface NavigationContextType {
  navigate: NavigateFunction;
  navigateToAuth: () => void;
  navigateToHome: () => void;
  navigateWithReplace: (path: string) => void;
  navigateWithOptions: (path: string, options?: NavigateOptions) => void;
  navigateBack: () => void;
  navigateForward: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateToAuth = useCallback(() => {
    log.navigation(location.pathname, '/auth', 'replace');
    navigate('/auth', { replace: true });
  }, [navigate, location]);

  const navigateToHome = useCallback(() => {
    log.navigation(location.pathname, '/', 'replace');
    navigate('/', { replace: true });
  }, [navigate, location]);

  const navigateWithReplace = useCallback((path: string) => {
    log.navigation(location.pathname, path, 'replace');
    navigate(path, { replace: true });
  }, [navigate, location]);

  const navigateWithOptions = useCallback((path: string, options?: NavigateOptions) => {
    const method = options?.replace ? 'replace' : 'push';
    log.navigation(location.pathname, path, method);
    navigate(path, options);
  }, [navigate, location]);

  const navigateBack = useCallback(() => {
    log.navigation(location.pathname, '[previous]', 'back');
    navigate(-1);
  }, [navigate, location]);

  const navigateForward = useCallback(() => {
    log.navigation(location.pathname, '[next]', 'push');
    navigate(1);
  }, [navigate, location]);

  const value: NavigationContextType = useMemo(() => ({
    navigate,
    navigateToAuth,
    navigateToHome,
    navigateWithReplace,
    navigateWithOptions,
    navigateBack,
    navigateForward,
  }), [navigate, location.pathname]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextType {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    const error = new Error('useNavigation must be used within a NavigationProvider');
    log.error('Navigation Context Error', 'react', {
      error: error.message,
      component: 'useNavigation',
      stackTrace: error.stack
    });
    throw error;
  }
  return context;
}

// Global navigation utility for use outside React components (like API interceptors)
interface GlobalNavigationCallbacks {
  navigateToAuth?: () => void;
  navigateToHome?: () => void;
  navigateWithReplace?: (path: string) => void;
  navigateWithOptions?: (path: string, options?: NavigateOptions) => void;
  navigateBack?: () => void;
  navigateForward?: () => void;
}

let globalNavigationCallbacks: GlobalNavigationCallbacks = {};

export function setGlobalNavigationCallbacks(callbacks: GlobalNavigationCallbacks): void {
  globalNavigationCallbacks = { ...callbacks };
  log.info('Global navigation callbacks initialized', 'navigation', {
    callbacksAvailable: Object.keys(callbacks)
  });
}

export function globalNavigateToAuth(): void {
  if (globalNavigationCallbacks.navigateToAuth) {
    log.userAction('global_navigation', 'auth_redirect', { method: 'callback' });
    globalNavigationCallbacks.navigateToAuth();
  } else {
    log.warn('Global navigation not initialized. Falling back to window.location', 'navigation', {
      targetPath: '/auth',
      fallbackMethod: 'window.location'
    });
    window.location.href = '/auth';
  }
}

export function globalNavigateToHome(): void {
  if (globalNavigationCallbacks.navigateToHome) {
    log.userAction('global_navigation', 'home_redirect', { method: 'callback' });
    globalNavigationCallbacks.navigateToHome();
  } else {
    log.warn('Global navigation not initialized. Falling back to window.location', 'navigation', {
      targetPath: '/',
      fallbackMethod: 'window.location'
    });
    window.location.href = '/';
  }
}

export function globalNavigateWithReplace(path: string): void {
  if (globalNavigationCallbacks.navigateWithReplace) {
    log.userAction('global_navigation', 'replace_redirect', {
      method: 'callback',
      targetPath: path
    });
    globalNavigationCallbacks.navigateWithReplace(path);
  } else {
    log.warn('Global navigation not initialized. Falling back to window.location', 'navigation', {
      targetPath: path,
      fallbackMethod: 'window.location'
    });
    window.location.href = path;
  }
}

export function globalNavigateWithOptions(path: string, options?: NavigateOptions): void {
  if (globalNavigationCallbacks.navigateWithOptions) {
    log.userAction('global_navigation', 'options_redirect', {
      method: 'callback',
      targetPath: path,
      options
    });
    globalNavigationCallbacks.navigateWithOptions(path, options);
  } else {
    log.warn('Global navigation not initialized. Falling back to window.location', 'navigation', {
      targetPath: path,
      options,
      fallbackMethod: 'window.location'
    });
    window.location.href = path;
  }
}

export function globalNavigateBack(): void {
  if (globalNavigationCallbacks.navigateBack) {
    log.userAction('global_navigation', 'back_navigation', { method: 'callback' });
    globalNavigationCallbacks.navigateBack();
  } else {
    log.warn('Global navigation not initialized. Falling back to window.history', 'navigation', {
      fallbackMethod: 'window.history.back'
    });
    window.history.back();
  }
}

export function globalNavigateForward(): void {
  if (globalNavigationCallbacks.navigateForward) {
    log.userAction('global_navigation', 'forward_navigation', { method: 'callback' });
    globalNavigationCallbacks.navigateForward();
  } else {
    log.warn('Global navigation not initialized. Falling back to window.history', 'navigation', {
      fallbackMethod: 'window.history.forward'
    });
    window.history.forward();
  }
}