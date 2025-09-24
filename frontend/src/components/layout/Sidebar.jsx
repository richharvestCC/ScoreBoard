import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Chip,
  Typography,
  Avatar,
  useTheme,
  Drawer,
  IconButton,
  useMediaQuery,
  Backdrop
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
  ExpandLess,
  ExpandMore,
  AccountCircle,
  Code,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material';
import { useNavigation } from '../../contexts/NavigationContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const theme = useTheme();
  const { navigate } = useNavigation();
  const location = useLocation();
  const { isOpen, toggleSidebar, closeSidebar, sidebarWidth } = useSidebar();
  const { user } = useAuth();
  const [openSubmenu, setOpenSubmenu] = useState({});

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  const handleSubmenuClick = (key) => {
    setOpenSubmenu(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isActive = (path) => location.pathname === path;

  const handleItemClick = (path) => {
    navigate(path);
    if (isMobile) {
      closeSidebar();
    }
  };

  const menuItems = [
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
  ];

  const developmentItems = [
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
  ];

  const adminItems = [
    {
      id: 'admin',
      text: '관리자',
      icon: <AdminPanelSettings />,
      path: '/admin',
      badge: 4
    }
  ];

  const MenuItem = ({ item, isSubmenu = false }) => (
    <ListItem
      disablePadding
      sx={{
        pl: isSubmenu ? 2 : 0,
        mb: 0.5
      }}
    >
      <ListItemButton
        onClick={() => handleItemClick(item.path)}
        selected={isActive(item.path)}
        sx={{
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
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 40,
            mr: 1.5,
            justifyContent: 'center',
            color: isActive(item.path) ? 'inherit' : theme.palette.text.secondary
          }}
        >
          {item.icon}
        </ListItemIcon>
        <ListItemText
          primary={item.text}
          primaryTypographyProps={{
            fontSize: '0.875rem',
            fontWeight: isActive(item.path) ? 600 : 400
          }}
        />
        {item.badge && (
          <Chip
            label={item.badge}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.75rem',
              backgroundColor: isActive(item.path)
                ? 'rgba(255,255,255,0.2)'
                : theme.palette.secondary.main,
              color: isActive(item.path) ? 'white' : 'white'
            }}
          />
        )}
      </ListItemButton>
    </ListItem>
  );

  const MenuSection = ({ title, items, collapsible = false, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
      <Box sx={{ mb: 2 }}>
        {title && (
          <Typography
            variant="caption"
            sx={{
              px: 2,
              py: 1,
              display: 'block',
              color: theme.palette.text.secondary,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              fontSize: '0.75rem'
            }}
          >
            {title}
          </Typography>
        )}
        <List sx={{ py: 0 }}>
          {items.map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </List>
      </Box>
    );
  };

  const sidebarContent = (
    <Box
      sx={{
        height: '100vh',
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Logo/Brand Section */}
      <Box
        sx={{
          p: 3,
          pb: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          minHeight: 72
        }}
      >
        <IconButton
          onClick={toggleSidebar}
          sx={{
            width: 40,
            height: 40,
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            }
          }}
        >
          <Sports />
        </IconButton>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1.125rem',
              color: theme.palette.text.primary
            }}
          >
            ScoreBoard
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '0.75rem'
            }}
          >
            Sports Management
          </Typography>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 2 }}>
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
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.default
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 1.5,
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Avatar sx={{ width: 32, height: 32 }}>
            <AccountCircle />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: '0.875rem',
                color: theme.palette.text.primary,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {user?.username || user?.email || 'UI 개발자'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '0.75rem'
              }}
            >
              {user?.role || 'Development Mode'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <>
        <Drawer
          anchor="left"
          open={isOpen}
          onClose={closeSidebar}
          variant="temporary"
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: sidebarWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          {sidebarContent}
        </Drawer>
        {isOpen && (
          <Backdrop
            sx={{ zIndex: theme.zIndex.drawer - 1 }}
            open={isOpen}
            onClick={closeSidebar}
          />
        )}
      </>
    );
  }

  // Desktop and Tablet - always 280px when visible
  return (
    <Box
      sx={{
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
      }}
    >
      {sidebarContent}
    </Box>
  );
};

export default Sidebar;