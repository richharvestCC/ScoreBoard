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
  IconButton,
  useMediaQuery,
  Backdrop,
  SxProps,
  Theme
} from '@mui/material';
import {
  Dashboard,
  Sports,
  Groups,
  Stadium,
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

// Type definitions
interface MenuItemData {
  id: string;
  text: string;
  icon: React.ReactElement;
  path: string;
  badge: number | null;
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

  // Memoized sx objects for performance
  const listItemSx = useMemo<SxProps<Theme>>(() => ({
    pl: isSubmenu ? 2 : 0,
    mb: 0.5
  }), [isSubmenu]);

  const listItemButtonSx = useMemo<SxProps<Theme>>(() => ({
    borderRadius: 2,
    mx: 1,
    py: 1.5,
    minHeight: 48,
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
  }), [theme.palette.primary.main, theme.palette.primary.dark, theme.palette.action.hover]);

  const listItemIconSx = useMemo<SxProps<Theme>>(() => ({
    minWidth: 40,
    mr: 1.5,
    justifyContent: 'center',
    color: isActive ? 'inherit' : theme.palette.text.secondary
  }), [isActive, theme.palette.text.secondary]);

  const primaryTypographyProps = useMemo(() => ({
    fontSize: '0.875rem',
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
        <ListItemText
          primary={item.text}
          primaryTypographyProps={primaryTypographyProps}
        />
        {item.badge && (
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
  const { closeSidebar } = useSidebar();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
      {title && (
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
  const { isOpen, toggleSidebar, closeSidebar, sidebarWidth } = useSidebar();
  const { user } = useAuth();
  const { t } = useLanguage();

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
      id: 'competitions',
      text: '대회',
      icon: <Stadium />,
      path: '/competitions',
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
      id: 'tournaments',
      text: '토너먼트',
      icon: <EmojiEvents />,
      path: '/tournaments',
      badge: null
    },
    {
      id: 'live',
      text: '라이브',
      icon: <LiveTv />,
      path: '/live',
      badge: 3
    },
    {
      id: 'templates',
      text: '템플릿',
      icon: <Assignment />,
      path: '/templates',
      badge: null
    }
  ], []);

  const developmentItems = useMemo<MenuItemData[]>(() => [
    {
      id: 'theme',
      text: '테마',
      icon: <ColorLens />,
      path: '/theme',
      badge: null
    },
    {
      id: 'style-guide',
      text: '스타일 가이드',
      icon: <Palette />,
      path: '/style-dash',
      badge: null
    }
  ], []);

  const adminItems = useMemo<MenuItemData[]>(() => [
    {
      id: 'admin',
      text: '관리자',
      icon: <AdminPanelSettings />,
      path: '/admin',
      badge: 4
    }
  ], []);

  // Memoized sx objects for main container elements
  const sidebarContainerSx = useMemo<SxProps<Theme>>(() => ({
    height: '100vh',
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  }), [theme.palette.background.paper]);

  const headerSx = useMemo<SxProps<Theme>>(() => ({
    p: 3,
    pb: 2,
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    minHeight: 72
  }), [theme.palette.divider]);

  const logoButtonSx = useMemo<SxProps<Theme>>(() => ({
    width: 40,
    height: 40,
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    }
  }), [theme.palette.primary.main, theme.palette.primary.dark]);

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
    width: sidebarWidth,
    height: '100vh',
    borderRight: `1px solid ${theme.palette.divider}`,
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: theme.zIndex.drawer,
    boxShadow: '0 0 10px rgba(0,0,0,0.05)',
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }), [sidebarWidth, theme.palette.divider, theme.zIndex.drawer, isOpen, theme.transitions]);

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
        <IconButton
          onClick={handleToggleSidebar}
          sx={logoButtonSx}
        >
          <Sports />
        </IconButton>
        <Box>
          <Typography variant="h6" sx={titleSx}>
            {t({ ko: '매치카드', en: 'MatchCard' })}
          </Typography>
          <Typography variant="caption" sx={subtitleSx}>
            {t({ ko: '풋볼 기록, 데이터 관리', en: 'Your Football Data' })}
          </Typography>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={navSx}>
        <MenuSection items={menuItems} />
        <MenuSection
          title="Development"
          items={developmentItems}
        />
        <MenuSection
          title="Administration"
          items={adminItems}
        />
      </Box>

      {/* User Profile Section */}
      <Box sx={profileSectionSx}>
        <Box sx={profileBoxSx}>
          <Avatar sx={avatarSx}>
            <AccountCircle />
          </Avatar>
          <Box sx={userBoxSx}>
            <Typography variant="body2" sx={usernameSx}>
              {user?.username || user?.email || 'UI 개발자'}
            </Typography>
            <Typography variant="caption" sx={roleSx}>
              {user?.role || 'Development Mode'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  ), [
    sidebarContainerSx, headerSx, handleToggleSidebar, logoButtonSx, titleSx, t, subtitleSx,
    navSx, menuItems, developmentItems, adminItems, profileSectionSx, profileBoxSx,
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