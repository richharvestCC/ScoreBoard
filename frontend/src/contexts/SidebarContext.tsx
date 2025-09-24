import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';

interface SidebarContextType {
  isOpen: boolean;
  isCollapsed: boolean;
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
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg')); // >= 1200px
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg')); // 900px - 1199px
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 900px

  const [isOpen, setIsOpen] = useState(true);

  const sidebarWidth = 280;
  const collapsedWidth = 72;

  // Auto-manage sidebar state based on screen size
  useEffect(() => {
    if (isDesktop) {
      setIsOpen(true); // Always open on desktop
    } else if (isTablet) {
      setIsOpen(false); // Hidden by default on tablet
    } else if (isMobile) {
      setIsOpen(false); // Closed by default on mobile
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

  // Sidebar is never collapsed - always 280px width when open
  const isCollapsed = false;

  const value: SidebarContextType = {
    isOpen,
    isCollapsed,
    toggleSidebar,
    closeSidebar,
    openSidebar,
    sidebarWidth,
    collapsedWidth,
  };

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};