import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import { AccountCircle, Sports, ExitToApp, Groups, EmojiEvents } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useTypedNavigation } from '../../hooks/useTypedNavigation';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const {
    navigateToProfile,
    navigateToClubs,
    navigateToMatches,
    navigateToTournaments,
    navigateToAuth
  } = useTypedNavigation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    navigateToProfile();
    handleClose();
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Sports sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          ScoreBoard
        </Typography>

        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              color="inherit"
              startIcon={<Groups />}
              onClick={navigateToClubs}
              sx={{ mr: 2 }}
            >
              클럽
            </Button>

            <Button
              color="inherit"
              startIcon={<Sports />}
              onClick={navigateToMatches}
              sx={{ mr: 2 }}
            >
              경기
            </Button>

            <Button
              color="inherit"
              startIcon={<EmojiEvents />}
              onClick={navigateToTournaments}
              sx={{ mr: 2 }}
            >
              토너먼트
            </Button>

            <Typography variant="body1" sx={{ mr: 2 }}>
              안녕하세요, {user?.name || user?.user_id}님!
            </Typography>

            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : <AccountCircle />}
              </Avatar>
            </IconButton>

            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
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
              <MenuItem onClick={handleProfile}>
                <AccountCircle sx={{ mr: 1 }} />
                프로필
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 1 }} />
                로그아웃
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button color="inherit" onClick={navigateToAuth}>
            로그인
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;