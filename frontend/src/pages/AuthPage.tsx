import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  useTheme,
  alpha,
  Fade,
  Slide
} from '@mui/material';
import {
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Sports as SportsIcon
} from '@mui/icons-material';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import glassmorphism from '../theme/glassmorphism';

// AuthPage 컴포넌트의 props 타입 정의
interface AuthPageProps {
  initialMode?: 'login' | 'register';
}

// 폼 타입 정의
type AuthMode = 'login' | 'register';

/**
 * 인증 페이지 - Material 3 + Glassmorphism 디자인
 * - TypeScript 완전 지원
 * - 향상된 폼 유효성 검사
 * - 로딩 상태 UX 개선
 * - 개발용 우회 로직 지원
 */
const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login'
}) => {
  const theme = useTheme();
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 모드 전환 핸들러 (useCallback으로 성능 최적화)
  const switchToRegister = useCallback(() => {
    if (authMode === 'register') return;
    setIsTransitioning(true);
    setTimeout(() => {
      setAuthMode('register');
      setIsTransitioning(false);
    }, 200);
  }, [authMode]);

  const switchToLogin = useCallback(() => {
    if (authMode === 'login') return;
    setIsTransitioning(true);
    setTimeout(() => {
      setAuthMode('login');
      setIsTransitioning(false);
    }, 200);
  }, [authMode]);

  // 현재 모드에 따른 설정
  const authConfig = {
    login: {
      title: '로그인',
      subtitle: '계정에 접속하여 스포츠 활동을 관리해보세요',
      icon: <LoginIcon sx={{ fontSize: 32 }} />,
      component: <LoginForm onSwitchToRegister={switchToRegister} />
    },
    register: {
      title: '회원가입',
      subtitle: '새 계정을 만들어 스포츠 커뮤니티에 참여해보세요',
      icon: <RegisterIcon sx={{ fontSize: 32 }} />,
      component: <RegisterForm onSwitchToLogin={switchToLogin} />
    }
  };

  const currentConfig = authConfig[authMode];

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      // 배경 그라데이션
      background: `linear-gradient(135deg,
        ${alpha(theme.palette.primary.main, 0.1)} 0%,
        ${alpha(theme.palette.secondary.main, 0.05)} 50%,
        ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
      // 배경 패턴 효과
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `radial-gradient(circle at 25% 25%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
                         radial-gradient(circle at 75% 75%, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 50%)`,
        zIndex: 0
      }
    }}>
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={800}>
          <Paper sx={{
            ...glassmorphism.styles.modal,
            p: { xs: 3, sm: 4 },
            position: 'relative',
            overflow: 'hidden',
            maxWidth: '500px',
            mx: 'auto'
          }}>
            {/* 헤더 섹션 */}
            <Box sx={{
              textAlign: 'center',
              mb: 4,
              position: 'relative',
              zIndex: 1
            }}>
              {/* 로고/아이콘 영역 */}
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '20px',
                background: glassmorphism.colors.surface.strong,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                border: `1px solid ${glassmorphism.colors.surface.medium}`,
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg,
                    ${alpha(theme.palette.primary.main, 0.1)},
                    ${alpha(theme.palette.secondary.main, 0.1)})`,
                  borderRadius: '20px',
                  zIndex: -1
                }
              }}>
                <SportsIcon sx={{
                  color: theme.palette.primary.main,
                  fontSize: 40
                }} />
              </Box>

              {/* 타이틀 */}
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  mb: 1,
                  fontSize: { xs: '1.75rem', sm: '2rem' }
                }}
              >
                ScoreBoard
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: alpha(theme.palette.text.primary, 0.7),
                  mb: 3,
                  fontSize: '1rem',
                  lineHeight: 1.5
                }}
              >
                스포츠 커뮤니티 플랫폼
              </Typography>

              {/* 현재 모드 표시 */}
              <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={2}
                sx={{ mb: 2 }}
              >
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  background: glassmorphism.colors.surface.medium,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${glassmorphism.colors.surface.light}`,
                }}>
                  {React.cloneElement(currentConfig.icon, {
                    sx: { color: theme.palette.primary.main, fontSize: 24 }
                  })}
                </Box>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      fontSize: '1.1rem',
                      mb: 0.5
                    }}
                  >
                    {currentConfig.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: alpha(theme.palette.text.primary, 0.6),
                      fontSize: '0.875rem',
                      lineHeight: 1.3,
                      maxWidth: '280px'
                    }}
                  >
                    {currentConfig.subtitle}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* 폼 섹션 */}
            <Box sx={{ position: 'relative' }}>
              <Slide
                direction="left"
                in={!isTransitioning}
                timeout={300}
                mountOnEnter
                unmountOnExit
              >
                <Box>
                  {currentConfig.component}
                </Box>
              </Slide>
            </Box>

            {/* 개발 모드 표시 */}
            {process.env.NODE_ENV === 'development' && (
              <Box sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 10
              }}>
                <Typography
                  variant="caption"
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '8px',
                    background: alpha(theme.palette.warning.main, 0.1),
                    color: theme.palette.warning.main,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
                  }}
                >
                  DEV MODE
                </Typography>
              </Box>
            )}

            {/* 배경 장식 요소 */}
            <Box sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: `radial-gradient(circle,
                ${alpha(theme.palette.primary.main, 0.08)} 0%,
                transparent 70%)`,
              zIndex: 0
            }} />
            <Box sx={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: `radial-gradient(circle,
                ${alpha(theme.palette.secondary.main, 0.06)} 0%,
                transparent 70%)`,
              zIndex: 0
            }} />
          </Paper>
        </Fade>

        {/* 푸터 정보 */}
        <Fade in timeout={1200}>
          <Box sx={{
            textAlign: 'center',
            mt: 4,
            '& > *': {
              color: alpha(theme.palette.text.primary, 0.6)
            }
          }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              © 2024 ScoreBoard. All rights reserved.
            </Typography>
            <Typography variant="caption">
              Version 1.0.0 - Modern Sports Management Platform
            </Typography>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

// React.memo로 성능 최적화
export default React.memo(AuthPage);