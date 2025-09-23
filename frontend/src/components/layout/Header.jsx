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
import { AccountCircle, Sports, ExitToApp, Groups, EmojiEvents, Assignment, AdminPanelSettings, LiveTv, Stadium } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  // Debug logging
  console.log('Header - isAuthenticated:', isAuthenticated);
  console.log('Header - user:', user);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
              startIcon={<Stadium />}
              onClick={() => navigate('/competitions')}
              sx={{ mr: 2 }}
            >
              대회
            </Button>

            <Button
              color="inherit"
              startIcon={<Groups />}
              onClick={() => navigate('/clubs')}
              sx={{ mr: 2 }}
            >
              클럽
            </Button>

            <Button
              color="inherit"
              startIcon={<Sports />}
              onClick={() => navigate('/matches')}
              sx={{ mr: 2 }}
            >
              경기
            </Button>

            <Button
              color="inherit"
              startIcon={<EmojiEvents />}
              onClick={() => navigate('/tournaments')}
              sx={{ mr: 2 }}
            >
              토너먼트
            </Button>

            <Button
              color="inherit"
              startIcon={<Assignment />}
              onClick={() => navigate('/templates')}
              sx={{ mr: 2 }}
            >
              템플릿
            </Button>

            <Button
              color="inherit"
              startIcon={<LiveTv />}
              onClick={() => navigate('/live')}
              sx={{ mr: 2 }}
            >
              라이브
            </Button>

            {user && ['admin', 'moderator'].includes(user.role) && (
              <Button
                color="inherit"
                startIcon={<AdminPanelSettings />}
                onClick={() => navigate('/admin')}
                sx={{ mr: 2 }}
              >
                관리자
              </Button>
            )}

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
              <MenuItem onClick={handleClose}>
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
          <Button color="inherit" href="/auth">
            로그인
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;