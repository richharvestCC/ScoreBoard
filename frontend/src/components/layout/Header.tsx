import React, { useMemo, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  useTheme,
  useMediaQuery,
  Switch,
  SxProps,
  Theme
} from '@mui/material';
import { AccountCircle, ExitToApp, Notifications, Menu as MenuIcon } from '@mui/icons-material';
import { useNavigation } from '../../contexts/NavigationContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface HeaderProps {
  // Future extensibility for header customization
}

const Header: React.FC<HeaderProps> = React.memo(() => {
  const theme = useTheme();
  const { navigate } = useNavigation();
  const { isOpen, toggleSidebar, sidebarWidth } = useSidebar();
  const { language, toggleLanguage, t } = useLanguage();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  // Memoized sx objects for performance
  const appBarSx = useMemo<SxProps<Theme>>(() => ({
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: '0 1px 0 rgba(0, 0, 0, 0.05)',
    borderBottom: `1px solid ${theme.palette.divider}`,
    left: isMobile ? 0 : (isOpen ? sidebarWidth : 0),
    width: isMobile ? '100%' : (isOpen ? `calc(100% - ${sidebarWidth}px)` : '100%'),
    zIndex: theme.zIndex.drawer - 1,
    transition: theme.transitions.create(['left', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }), [
    theme.palette.background.paper,
    theme.palette.text.primary,
    theme.palette.divider,
    theme.zIndex.drawer,
    theme.transitions,
    isMobile,
    isOpen,
    sidebarWidth
  ]);

  const rightActionsSx = useMemo<SxProps<Theme>>(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: 1
  }), []);

  const languageToggleSx = useMemo<SxProps<Theme>>(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: 1
  }), []);

  const koTextSx = useMemo<SxProps<Theme>>(() => ({
    color: language === 'ko' ? 'primary.main' : 'text.secondary'
  }), [language]);

  const enTextSx = useMemo<SxProps<Theme>>(() => ({
    color: language === 'en' ? 'primary.main' : 'text.secondary'
  }), [language]);

  const switchSx = useMemo<SxProps<Theme>>(() => ({
    '& .MuiSwitch-switchBase.Mui-checked': {
      color: 'primary.main',
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
      backgroundColor: 'primary.main',
    },
  }), []);

  const avatarSx = useMemo<SxProps<Theme>>(() => ({
    width: 32,
    height: 32
  }), []);

  // Memoized menu anchor origin and transform origin
  const menuAnchorOrigin = useMemo(() => ({
    vertical: 'bottom' as const,
    horizontal: 'right' as const,
  }), []);

  const menuTransformOrigin = useMemo(() => ({
    vertical: 'top' as const,
    horizontal: 'right' as const,
  }), []);

  // Optimized event handlers
  const handleMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    toggleSidebar();
  }, [toggleSidebar]);

  const handleToggleLanguage = useCallback(() => {
    toggleLanguage();
  }, [toggleLanguage]);

  const handleNavigateToAuth = useCallback(() => {
    handleClose();
    navigate('/auth');
  }, [navigate, handleClose]);

  const handleProfileClick = useCallback(() => {
    handleClose();
  }, [handleClose]);

  const isMenuOpen = Boolean(anchorEl);

  return (
    <AppBar position="fixed" sx={appBarSx}>
      <Toolbar>
        {/* Mobile hamburger menu */}
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleToggleSidebar}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Tablet toggle button */}
        {isTablet && (
          <IconButton
            color="inherit"
            aria-label="toggle sidebar"
            edge="start"
            onClick={handleToggleSidebar}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Search and breadcrumbs could go here */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {/* Dynamic page title could go here */}
        </Typography>

        {/* Right side actions */}
        <Box sx={rightActionsSx}>
          {/* Language Toggle */}
          <Box sx={languageToggleSx}>
            <Typography variant="body2" sx={koTextSx}>
              KO
            </Typography>
            <Switch
              checked={language === 'en'}
              onChange={handleToggleLanguage}
              size="small"
              sx={switchSx}
            />
            <Typography variant="body2" sx={enTextSx}>
              EN
            </Typography>
          </Box>

          {/* Notifications */}
          <IconButton
            color="inherit"
            aria-label="notifications"
          >
            <Notifications />
          </IconButton>

          {/* User Menu */}
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar sx={avatarSx}>
              <AccountCircle />
            </Avatar>
          </IconButton>

          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={menuAnchorOrigin}
            keepMounted
            transformOrigin={menuTransformOrigin}
            open={isMenuOpen}
            onClose={handleClose}
          >
            <MenuItem onClick={handleProfileClick}>
              <AccountCircle sx={{ mr: 1 }} />
              {t({ ko: '프로필', en: 'Profile' })}
            </MenuItem>
            <MenuItem onClick={handleNavigateToAuth}>
              <ExitToApp sx={{ mr: 1 }} />
              {t({ ko: '로그인 페이지', en: 'Login Page' })}
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
});

Header.displayName = 'Header';

export default Header;