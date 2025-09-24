import React, { useState } from 'react';
import { Box } from '@mui/material';
import { designTokens } from '../theme/designTokens';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const switchToRegister = () => setIsLogin(false);
  const switchToLogin = () => setIsLogin(true);

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: designTokens.colors.background.light.default,
      px: { xs: 2, sm: 0 },
      maxWidth: {
        xs: designTokens.containerMaxWidth.mobile,
        sm: '500px'
      },
      mx: 'auto'
    }}>
        {isLogin ? (
          <LoginForm onSwitchToRegister={switchToRegister} />
        ) : (
          <RegisterForm onSwitchToLogin={switchToLogin} />
        )}
    </Box>
  );
};

export default AuthPage;