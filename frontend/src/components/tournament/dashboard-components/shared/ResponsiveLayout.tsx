/**
 * ResponsiveLayout - Responsive Design System for Tournament Dashboard
 * Material Design 3 + React 18 + TypeScript
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTheme, useMediaQuery, Theme } from '@mui/material';
import { ResponsiveConfig, DeviceType, BreakpointKey } from '../../../../types/tournament';

// Breakpoint Configuration
export const BREAKPOINTS = {
  xs: 0,      // 0px+
  sm: 600,    // 600px+
  md: 768,    // 768px+ (tablet portrait)
  lg: 1024,   // 1024px+ (tablet landscape)
  xl: 1920,   // 1920px+ (desktop)
  xxl: 2560   // 2560px+ (large desktop)
} as const;

export const DEVICE_CONFIGS = {
  desktop: {
    minWidth: BREAKPOINTS.xl,
    bracketColumns: 'auto',
    controlPanel: 'bottom-fixed',
    zoomDefault: 1.0,
    touchOptimized: false,
    fullFeatures: true,
    supported: true
  },
  'tablet-landscape': {
    minWidth: BREAKPOINTS.lg,
    maxWidth: BREAKPOINTS.xl - 1,
    bracketColumns: 'scrollable-horizontal',
    controlPanel: 'bottom-sticky',
    zoomDefault: 0.8,
    touchOptimized: true,
    fullFeatures: true,
    supported: true
  },
  'tablet-portrait': {
    minWidth: BREAKPOINTS.md,
    maxWidth: BREAKPOINTS.lg - 1,
    bracketColumns: 'single-column-scroll',
    controlPanel: 'collapsed',
    zoomDefault: 0.6,
    touchOptimized: true,
    fullFeatures: false,
    supported: true
  },
  mobile: {
    maxWidth: BREAKPOINTS.md - 1,
    bracketColumns: 'disabled',
    controlPanel: 'bottom-sheet',
    zoomDefault: 0.5,
    touchOptimized: true,
    fullFeatures: false,
    supported: false
  }
} as const;

// Context
interface ResponsiveContextValue {
  config: ResponsiveConfig;
  dimensions: {
    width: number;
    height: number;
  };
  isSupportedDevice: boolean;
  deviceConfig: typeof DEVICE_CONFIGS[keyof typeof DEVICE_CONFIGS];
  updateDimensions: () => void;
}

const ResponsiveContext = createContext<ResponsiveContextValue | undefined>(undefined);

// Custom Hook
export const useResponsive = (): ResponsiveContextValue => {
  const context = useContext(ResponsiveContext);
  if (!context) {
    throw new Error('useResponsive must be used within ResponsiveProvider');
  }
  return context;
};

// Utility Functions
export const getDeviceType = (width: number): DeviceType => {
  if (width >= BREAKPOINTS.xl) return 'desktop';
  if (width >= BREAKPOINTS.lg) return 'tablet-landscape';
  if (width >= BREAKPOINTS.md) return 'tablet-portrait';
  return 'mobile';
};

export const getBreakpoint = (width: number): BreakpointKey => {
  if (width >= BREAKPOINTS.xxl) return 'xxl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
};

export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const supportsHover = (): boolean => {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(hover: hover)').matches;
};

export const getOrientation = (): 'landscape' | 'portrait' => {
  if (typeof window === 'undefined') return 'landscape';
  return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
};

// Provider Component
interface ResponsiveProviderProps {
  children: React.ReactNode;
}

export const ResponsiveProvider: React.FC<ResponsiveProviderProps> = ({ children }) => {
  const theme = useTheme();
  const [dimensions, setDimensions] = useState({
    width: 1920, // Default SSR-safe values
    height: 1080
  });
  const [isClient, setIsClient] = useState(false);

  const deviceType = getDeviceType(dimensions.width);
  const breakpoint = getBreakpoint(dimensions.width);
  const deviceConfig = DEVICE_CONFIGS[deviceType];
  const isSupportedDevice = deviceConfig.supported !== false;

  const config: ResponsiveConfig = {
    device: deviceType,
    breakpoint,
    isTouchDevice: isClient ? isTouchDevice() : false,
    supportsHover: isClient ? supportsHover() : true, // Default to hover support for SSR
    orientation: isClient ? getOrientation() : 'landscape' // Default orientation for SSR
  };

  const updateDimensions = () => {
    if (typeof window !== 'undefined') {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
  };

  // Client-side initialization effect
  useEffect(() => {
    setIsClient(true);
    updateDimensions(); // Set actual dimensions once client-side
  }, []);

  // Resize and orientation change effects
  useEffect(() => {
    if (!isClient) return;

    const handleResize = () => {
      updateDimensions();
    };

    const handleOrientationChange = () => {
      // Delay to allow for orientation change to complete
      setTimeout(updateDimensions, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [isClient]);

  const contextValue: ResponsiveContextValue = {
    config,
    dimensions,
    isSupportedDevice,
    deviceConfig,
    updateDimensions
  };

  return (
    <ResponsiveContext.Provider value={contextValue}>
      {children}
    </ResponsiveContext.Provider>
  );
};

// Responsive Component Wrapper
interface ResponsiveWrapperProps {
  children: React.ReactNode;
  supportedDevices?: DeviceType[];
  fallback?: React.ReactNode;
}

export const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  children,
  supportedDevices = ['desktop', 'tablet-landscape', 'tablet-portrait'],
  fallback
}) => {
  const { config, isSupportedDevice } = useResponsive();

  const isDeviceSupported = supportedDevices.includes(config.device);

  if (!isSupportedDevice || !isDeviceSupported) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

// Responsive Visibility Hook
export const useResponsiveVisibility = (
  visibleOn: DeviceType[] = ['desktop', 'tablet-landscape', 'tablet-portrait']
) => {
  const { config } = useResponsive();
  return visibleOn.includes(config.device);
};

// Responsive Value Hook
export const useResponsiveValue = <T,>(values: Partial<Record<DeviceType, T>>, fallback: T): T => {
  const { config } = useResponsive();
  return values[config.device] ?? fallback;
};

// CSS-in-JS Responsive Utilities
export const createResponsiveStyles = (theme: Theme) => ({
  // Container styles
  fullHeight: {
    height: '100vh',
    overflow: 'hidden'
  },

  // Desktop styles
  desktop: {
    [theme.breakpoints.up('xl')]: {
      display: 'flex'
    },
    [theme.breakpoints.down('xl')]: {
      display: 'none'
    }
  },

  // Tablet landscape styles
  tabletLandscape: {
    [theme.breakpoints.between('lg', 'xl')]: {
      display: 'flex'
    },
    [theme.breakpoints.down('lg')]: {
      display: 'none'
    },
    [theme.breakpoints.up('xl')]: {
      display: 'none'
    }
  },

  // Tablet portrait styles
  tabletPortrait: {
    [theme.breakpoints.between('md', 'lg')]: {
      display: 'flex'
    },
    [theme.breakpoints.down('md')]: {
      display: 'none'
    },
    [theme.breakpoints.up('lg')]: {
      display: 'none'
    }
  },

  // Mobile styles (hidden)
  mobile: {
    [theme.breakpoints.down('md')]: {
      display: 'none'
    }
  },

  // Responsive spacing
  responsivePadding: {
    [theme.breakpoints.up('xl')]: {
      padding: theme.spacing(4)
    },
    [theme.breakpoints.between('lg', 'xl')]: {
      padding: theme.spacing(3)
    },
    [theme.breakpoints.between('md', 'lg')]: {
      padding: theme.spacing(2)
    }
  },

  // Touch-optimized targets
  touchTarget: {
    minHeight: 44,
    minWidth: 44,
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius
  },

  // Responsive text
  responsiveText: {
    [theme.breakpoints.up('xl')]: {
      fontSize: '1.2rem'
    },
    [theme.breakpoints.between('lg', 'xl')]: {
      fontSize: '1.1rem'
    },
    [theme.breakpoints.between('md', 'lg')]: {
      fontSize: '1rem'
    }
  }
});

export default ResponsiveProvider;