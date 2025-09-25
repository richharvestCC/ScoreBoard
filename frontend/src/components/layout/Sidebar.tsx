import React, { useMemo, useCallback } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Typography,
  Avatar,
  useTheme,
  Drawer,
  useMediaQuery,
  Backdrop,
  SxProps,
  Theme
} from '@mui/material';
import {
  Dashboard,
  Sports,
  Groups,
  EmojiEvents,
  Assignment,
  LiveTv,
  AdminPanelSettings,
  Palette,
  ColorLens,
  AccountCircle
} from '@mui/icons-material';
import { useNavigation } from '../../contexts/NavigationContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import logoNormal from '../../assets/images/logos/logo-normal.png';
import logoWhite from '../../assets/images/logos/logo-white.png';

// Type definitions
interface MenuItemData {
  id: string;
  text: string;
  icon: React.ReactElement;
  path: string;
  badge: number | null;
  adminOnly?: boolean;
  requiredRoles?: string[];
}

interface MenuItemProps {
  item: MenuItemData;
  isSubmenu?: boolean;
  isActive: boolean;
  onClick: (path: string) => void;
}

interface MenuSectionProps {
  title?: string;
  items: MenuItemData[];
}

// Memoized MenuItem component with optimized sx objects
const MenuItem: React.FC<MenuItemProps> = React.memo(({ item, isSubmenu = false, isActive, onClick }) => {
  const theme = useTheme();
  const { isCollapsed } = useSidebar();

  // Memoized sx objects for performance
  const listItemSx = useMemo<SxProps<Theme>>(() => ({
    pl: isSubmenu ? 2 : 0,
    mb: 0.5
  }), [isSubmenu]);

  const listItemButtonSx = useMemo<SxProps<Theme>>(() => ({
    borderRadius: 2,
    mx: isCollapsed ? 0.5 : 1,
    py: 1.5,
    px: isCollapsed ? 1 : 2,
    minHeight: 48,
    justifyContent: isCollapsed ? 'center' : 'flex-start',
    '&.Mui-selected': {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
      '& .MuiListItemIcon-root': {
        color: 'white',
      },
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      }
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    }
  }), [theme.palette.primary.main, theme.palette.primary.dark, theme.palette.action.hover, isCollapsed]);

  const listItemIconSx = useMemo<SxProps<Theme>>(() => ({
    minWidth: 40,
    mr: 1.5,
    justifyContent: 'center',
    color: isActive ? 'inherit' : theme.palette.text.secondary
  }), [isActive, theme.palette.text.secondary]);

  const primaryTypographyProps = useMemo(() => ({
    fontSize: '1em',
    fontWeight: isActive ? 600 : 400
  }), [isActive]);

  const chipSx = useMemo<SxProps<Theme>>(() => ({
    height: 20,
    fontSize: '0.75rem',
    backgroundColor: isActive
      ? 'rgba(255,255,255,0.2)'
      : theme.palette.secondary.main,
    color: isActive ? 'white' : 'white'
  }), [isActive, theme.palette.secondary.main]);

  const handleClick = useCallback(() => {
    onClick(item.path);
  }, [onClick, item.path]);

  return (
    <ListItem disablePadding sx={listItemSx}>
      <ListItemButton
        onClick={handleClick}
        selected={isActive}
        sx={listItemButtonSx}
      >
        <ListItemIcon sx={listItemIconSx}>
          {item.icon}
        </ListItemIcon>
        {!isCollapsed && (
          <ListItemText
            primary={item.text}
            primaryTypographyProps={primaryTypographyProps}
          />
        )}
        {!isCollapsed && item.badge && (
          <Chip
            label={item.badge}
            size="small"
            sx={chipSx}
          />
        )}
      </ListItemButton>
    </ListItem>
  );
});

MenuItem.displayName = 'MenuItem';

// Memoized MenuSection component with optimized sx objects
const MenuSection: React.FC<MenuSectionProps> = React.memo(({ title, items }) => {
  const theme = useTheme();
  const location = useLocation();
  const { navigate } = useNavigation();
  const { closeSidebar, isCollapsed } = useSidebar();
  const isMobile = useMediaQuery('(max-width: 767px)');

  // Memoized sx objects
  const sectionSx = useMemo<SxProps<Theme>>(() => ({ mb: 2 }), []);

  const titleSx = useMemo<SxProps<Theme>>(() => ({
    px: 2,
    py: 1,
    display: 'block',
    color: theme.palette.text.secondary,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: '0.75rem'
  }), [theme.palette.text.secondary]);

  const listSx = useMemo<SxProps<Theme>>(() => ({ py: 0 }), []);

  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  const handleItemClick = useCallback((path: string) => {
    navigate(path);
    if (isMobile) {
      closeSidebar();
    }
  }, [navigate, isMobile, closeSidebar]);

  return (
    <Box sx={sectionSx}>
      {!isCollapsed && title && (
        <Typography
          variant="caption"
          sx={titleSx}
        >
          {title}
        </Typography>
      )}
      <List sx={listSx}>
        {items.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            isActive={isActive(item.path)}
            onClick={handleItemClick}
          />
        ))}
      </List>
    </Box>
  );
});

MenuSection.displayName = 'MenuSection';

const Sidebar: React.FC = React.memo(() => {
  const theme = useTheme();
  const { isOpen, isCollapsed, toggleSidebar, closeSidebar, sidebarWidth, collapsedWidth } = useSidebar();
  const { user } = useAuth();
  const { t } = useLanguage();

  const isMobile = useMediaQuery('(max-width: 767px)');

  // Memoized menu arrays for performance
  const menuItems = useMemo<MenuItemData[]>(() => [
    {
      id: 'dashboard',
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/',
      badge: null
    },
    {
      id: 'matches',
      text: '경기',
      icon: <Sports />,
      path: '/matches',
      badge: 8
    },
    {
      id: 'clubs',
      text: '클럽',
      icon: <Groups />,
      path: '/clubs',
      badge: null
    },
    {
      id: 'competitions',
      text: '대회',
      icon: <EmojiEvents />,
      path: '/competitions',
      badge: null,
      requiredRoles: ['admin', 'moderator', 'organizer']
    },
    {
      id: 'live',
      text: '라이브',
      icon: <LiveTv />,
      path: '/live',
      badge: 3,
      requiredRoles: ['admin', 'moderator']
    },
    {
      id: 'templates',
      text: '템플릿',
      icon: <Assignment />,
      path: '/templates',
      badge: null,
      adminOnly: true
    }
  ], []);

  const developmentItems = useMemo<MenuItemData[]>(() => [
    {
      id: 'theme',
      text: '테마',
      icon: <ColorLens />,
      path: '/theme',
      badge: null,
      adminOnly: true
    },
    {
      id: 'style-guide',
      text: '스타일 가이드',
      icon: <Palette />,
      path: '/style-dash',
      badge: null,
      adminOnly: true
    }
  ], []);

  const adminItems = useMemo<MenuItemData[]>(() => [
    {
      id: 'admin',
      text: '관리자',
      icon: <AdminPanelSettings />,
      path: '/admin',
      badge: 4,
      adminOnly: true
    }
  ], []);

  // Role-based menu filtering
  const visibleMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      if (item.adminOnly && !['admin', 'moderator'].includes(user?.role)) return false;
      if (item.requiredRoles && !item.requiredRoles.includes(user?.role)) return false;
      return true;
    });
  }, [menuItems, user?.role]);

  const visibleDevelopmentItems = useMemo(() => {
    return developmentItems.filter(item => {
      if (item.adminOnly && !['admin', 'moderator'].includes(user?.role)) return false;
      if (item.requiredRoles && !item.requiredRoles.includes(user?.role)) return false;
      return true;
    });
  }, [developmentItems, user?.role]);

  const visibleAdminItems = useMemo(() => {
    return adminItems.filter(item => {
      if (item.adminOnly && !['admin', 'moderator'].includes(user?.role)) return false;
      if (item.requiredRoles && !item.requiredRoles.includes(user?.role)) return false;
      return true;
    });
  }, [adminItems, user?.role]);

  // Memoized sx objects for main container elements
  const sidebarContainerSx = useMemo<SxProps<Theme>>(() => ({
    height: '100vh',
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  }), [theme.palette.background.paper]);

  const headerSx = useMemo<SxProps<Theme>>(() => ({
    p: isCollapsed ? 1.5 : 3,
    pb: isCollapsed ? 1.5 : 2,
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: isCollapsed ? 'center' : 'flex-start',
    gap: isCollapsed ? 0 : 1,
    minHeight: 72
  }), [theme.palette.divider, isCollapsed]);

  const logoContainerSx = useMemo<SxProps<Theme>>(() => ({
    width: 56,
    height: 56,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    padding: '8px',
    transition: theme.transitions.create(['background-color'], {
      duration: theme.transitions.duration.shortest,
    }),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    }
  }), [theme.palette.action.hover, theme.transitions]);

  const logoImageSx = useMemo<SxProps<Theme>>(() => ({
    width: '100%',
    height: '100%',
    objectFit: 'contain' as const,
  }), []);

  const titleSx = useMemo<SxProps<Theme>>(() => ({
    fontWeight: 700,
    fontSize: '1.125rem',
    color: theme.palette.text.primary
  }), [theme.palette.text.primary]);

  const subtitleSx = useMemo<SxProps<Theme>>(() => ({
    color: theme.palette.text.secondary,
    fontSize: '0.75rem'
  }), [theme.palette.text.secondary]);

  const navSx = useMemo<SxProps<Theme>>(() => ({ flex: 1, overflowY: 'auto', py: 2 }), []);

  const profileSectionSx = useMemo<SxProps<Theme>>(() => ({
    p: 2,
    borderTop: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.default
  }), [theme.palette.divider, theme.palette.background.default]);

  const profileBoxSx = useMemo<SxProps<Theme>>(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    p: 1.5,
    borderRadius: 2,
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`
  }), [theme.palette.background.paper, theme.palette.divider]);

  const avatarSx = useMemo<SxProps<Theme>>(() => ({ width: 32, height: 32 }), []);

  const userBoxSx = useMemo<SxProps<Theme>>(() => ({ flex: 1, minWidth: 0 }), []);

  const usernameSx = useMemo<SxProps<Theme>>(() => ({
    fontWeight: 600,
    fontSize: '0.875rem',
    color: theme.palette.text.primary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }), [theme.palette.text.primary]);

  const roleSx = useMemo<SxProps<Theme>>(() => ({
    color: theme.palette.text.secondary,
    fontSize: '0.75rem'
  }), [theme.palette.text.secondary]);

  const drawerSx = useMemo<SxProps<Theme>>(() => ({
    '& .MuiDrawer-paper': {
      width: sidebarWidth,
      boxSizing: 'border-box',
    },
  }), [sidebarWidth]);

  const backdropSx = useMemo<SxProps<Theme>>(() => ({ zIndex: theme.zIndex.drawer - 1 }), [theme.zIndex.drawer]);

  const desktopSidebarSx = useMemo<SxProps<Theme>>(() => ({
    width: isCollapsed ? collapsedWidth : sidebarWidth,
    height: '100vh',
    borderRight: `1px solid ${theme.palette.divider}`,
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: theme.zIndex.drawer,
    boxShadow: '0 0 10px rgba(0,0,0,0.05)',
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: theme.transitions.create(['transform', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }), [isCollapsed, collapsedWidth, sidebarWidth, theme.palette.divider, theme.zIndex.drawer, isOpen, theme.transitions]);

  // Memoized event handlers
  const handleToggleSidebar = useCallback(() => {
    toggleSidebar();
  }, [toggleSidebar]);

  const handleCloseSidebar = useCallback(() => {
    closeSidebar();
  }, [closeSidebar]);

  // Memoized sidebar content
  const sidebarContent = useMemo(() => (
    <Box sx={sidebarContainerSx}>
      {/* Logo/Brand Section */}
      <Box sx={headerSx}>
        <Box
          onClick={handleToggleSidebar}
          sx={logoContainerSx}
        >
          <Box
            component="img"
            src={theme.palette.mode === 'dark' ? logoWhite : logoNormal}
            alt="ScoreBoard Logo"
            sx={logoImageSx}
          />
        </Box>
        {!isCollapsed && (
          <Box>
            <Typography variant="h6" sx={titleSx}>
              {t({ ko: '스코어보드', en: 'ScoreBoard' })}
            </Typography>
            <Typography variant="caption" sx={subtitleSx}>
              {t({ ko: '스포츠 경기 관리 플랫폼', en: 'Sports Match Management' })}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Navigation Menu */}
      <Box sx={navSx}>
        <MenuSection items={visibleMenuItems} />
        {visibleDevelopmentItems.length > 0 && (
          <MenuSection
            title="Development"
            items={visibleDevelopmentItems}
          />
        )}
        {visibleAdminItems.length > 0 && (
          <MenuSection
            title="Administration"
            items={visibleAdminItems}
          />
        )}
      </Box>

      {/* User Profile Section */}
      {!isCollapsed && (
        <Box sx={profileSectionSx}>
          <Box sx={profileBoxSx}>
            <Avatar sx={avatarSx}>
              <AccountCircle />
            </Avatar>
            <Box sx={userBoxSx}>
              <Typography variant="body2" sx={usernameSx}>
                {user?.name || user?.username || user?.email || 'UI 개발자'}
              </Typography>
              <Typography variant="caption" sx={roleSx}>
                {user?.role || 'UI Dev Mode'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  ), [
    sidebarContainerSx, headerSx, handleToggleSidebar, logoContainerSx, logoImageSx, titleSx, t, subtitleSx, theme.palette.mode, isCollapsed,
    navSx, visibleMenuItems, visibleDevelopmentItems, visibleAdminItems, profileSectionSx, profileBoxSx,
    avatarSx, userBoxSx, usernameSx, user?.username, user?.email, user?.role, roleSx
  ]);

  if (isMobile) {
    return (
      <>
        <Drawer
          anchor="left"
          open={isOpen}
          onClose={handleCloseSidebar}
          variant="temporary"
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={drawerSx}
        >
          {sidebarContent}
        </Drawer>
        {isOpen && (
          <Backdrop
            sx={backdropSx}
            open={isOpen}
            onClick={handleCloseSidebar}
          />
        )}
      </>
    );
  }

  // Desktop and Tablet - always 280px when visible
  return (
    <Box sx={desktopSidebarSx}>
      {sidebarContent}
    </Box>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
