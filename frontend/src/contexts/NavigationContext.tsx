import React, { createContext, useContext, ReactNode } from 'react';
import { useNavigate, NavigateFunction } from 'react-router-dom';

interface NavigationContextType {
  navigate: NavigateFunction;
  navigateToAuth: () => void;
  navigateToHome: () => void;
  navigateWithReplace: (path: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const navigate = useNavigate();

  const navigateToAuth = () => {
    navigate('/auth', { replace: true });
  };

  const navigateToHome = () => {
    navigate('/', { replace: true });
  };

  const navigateWithReplace = (path: string) => {
    navigate(path, { replace: true });
  };

  const value: NavigationContextType = {
    navigate,
    navigateToAuth,
    navigateToHome,
    navigateWithReplace,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

// Global navigation utility for use outside React components (like API interceptors)
let globalNavigationCallbacks: {
  navigateToAuth?: () => void;
  navigateToHome?: () => void;
  navigateWithReplace?: (path: string) => void;
} = {};

export function setGlobalNavigationCallbacks(callbacks: typeof globalNavigationCallbacks) {
  globalNavigationCallbacks = callbacks;
}

export function globalNavigateToAuth() {
  if (globalNavigationCallbacks.navigateToAuth) {
    globalNavigationCallbacks.navigateToAuth();
  } else {
    console.warn('Global navigation not initialized. Falling back to window.location');
    window.location.href = '/auth';
  }
}

export function globalNavigateToHome() {
  if (globalNavigationCallbacks.navigateToHome) {
    globalNavigationCallbacks.navigateToHome();
  } else {
    console.warn('Global navigation not initialized. Falling back to window.location');
    window.location.href = '/';
  }
}

export function globalNavigateWithReplace(path: string) {
  if (globalNavigationCallbacks.navigateWithReplace) {
    globalNavigationCallbacks.navigateWithReplace(path);
  } else {
    console.warn('Global navigation not initialized. Falling back to window.location');
    window.location.href = path;
  }
}