import React from 'react';
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
  Switch
} from '@mui/material';
import { AccountCircle, ExitToApp, Notifications, Menu as MenuIcon } from '@mui/icons-material';
import { useNavigation } from '../../contexts/NavigationContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { useLanguage } from '../../contexts/LanguageContext';

const Header = () => {
  const theme = useTheme();
  const { navigate } = useNavigation();
  const { isOpen, toggleSidebar, sidebarWidth } = useSidebar();
  const { language, toggleLanguage, t } = useLanguage();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
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
      }}
    >
      <Toolbar>
        {/* Mobile hamburger menu */}
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleSidebar}
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
            onClick={toggleSidebar}
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Language Toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: language === 'ko' ? 'primary.main' : 'text.secondary' }}>
              KO
            </Typography>
            <Switch
              checked={language === 'en'}
              onChange={toggleLanguage}
              size="small"
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: 'primary.main',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: 'primary.main',
                },
              }}
            />
            <Typography variant="body2" sx={{ color: language === 'en' ? 'primary.main' : 'text.secondary' }}>
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
            <Avatar sx={{ width: 32, height: 32 }}>
              <AccountCircle />
            </Avatar>
          </IconButton>

          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>
              <AccountCircle sx={{ mr: 1 }} />
              {t({ ko: '프로필', en: 'Profile' })}
            </MenuItem>
            <MenuItem onClick={() => navigate('/auth')}>
              <ExitToApp sx={{ mr: 1 }} />
              {t({ ko: '로그인 페이지', en: 'Login Page' })}
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;