import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMediaQuery } from '@mui/material';

type SidebarMode = 'expanded' | 'collapsed' | 'hidden';

interface SidebarContextType {
  isOpen: boolean;
  isCollapsed: boolean;
  mode: SidebarMode;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
  sidebarWidth: number;
  collapsedWidth: number;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDesktop = useMediaQuery('(min-width: 1200px)'); // >= 1200px (expanded)
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1199px)'); // 768px - 1199px (collapsed)
  const isMobile = useMediaQuery('(max-width: 767px)'); // <= 767px (hidden)

  const [isOpen, setIsOpen] = useState(true);
  const [mode, setMode] = useState<SidebarMode>('expanded');

  const sidebarWidth = 280;
  const collapsedWidth = 72;

  // Auto-manage sidebar mode and state based on screen size
  useEffect(() => {
    if (isDesktop) {
      setMode('expanded');
      setIsOpen(true); // Always open and expanded on desktop
    } else if (isTablet) {
      setMode('collapsed');
      setIsOpen(true); // Always open but collapsed on tablet
    } else if (isMobile) {
      setMode('hidden');
      setIsOpen(false); // Hidden by default on mobile (overlay when opened)
    }
  }, [isDesktop, isTablet, isMobile]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const openSidebar = () => {
    setIsOpen(true);
  };

  // isCollapsed is true when in collapsed mode (tablet view)
  const isCollapsed = mode === 'collapsed';

  const value: SidebarContextType = {
    isOpen,
    isCollapsed,
    mode,
    toggleSidebar,
    closeSidebar,
    openSidebar,
    sidebarWidth,
    collapsedWidth,
  };

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};