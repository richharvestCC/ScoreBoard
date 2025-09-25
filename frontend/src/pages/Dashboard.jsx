import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Container,
  Stack,
  Chip,
  useTheme,
  alpha,
  Avatar,
  IconButton,
  Fade,
  Grow
} from '@mui/material';
import {
  Group,
  Sports,
  Timeline,
  Add,
  EmojiEvents,
  TrendingUp,
  ArrowForward,
  Analytics,
  CalendarToday,
  Settings,
  TrendingDown,
  Notifications
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import glassmorphism from '../theme/glassmorphism';

const Dashboard = React.memo(() => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    totalClubs: 12,
    upcomingMatches: 5,
    recentActivity: 8,
    winRate: 75
  });

  // 시간 업데이트 효과
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1분마다 업데이트
    return () => clearInterval(timer);
  }, []);

  const navigationCards = [
    {
      id: 'clubs',
      title: '내 클럽',
      description: '가입한 클럽 및 팀 관리',
      icon: <Group sx={{ fontSize: 32 }} />,
      action: '클럽 보기',
      href: '/clubs',
      color: theme.palette.primary.main,
      stats: stats.totalClubs,
      trend: '+2',
      gradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`
    },
    {
      id: 'matches',
      title: '경기 일정',
      description: '예정된 경기 및 결과 관리',
      icon: <Sports sx={{ fontSize: 32 }} />,
      action: '경기 보기',
      href: '/matches',
      color: theme.palette.success.main,
      stats: stats.upcomingMatches,
      trend: '+1',
      gradient: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.main, 0.05)})`
    },
    {
      id: 'competitions',
      title: '대회 관리',
      description: '토너먼트 및 리그 운영',
      icon: <EmojiEvents sx={{ fontSize: 32 }} />,
      action: '대회 보기',
      href: '/competitions',
      color: theme.palette.warning.main,
      stats: stats.recentActivity,
      trend: '+3',
      gradient: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.warning.main, 0.05)})`
    },
    {
      id: 'analytics',
      title: '통계 분석',
      description: '개인 및 팀 성과 분석',
      icon: <Analytics sx={{ fontSize: 32 }} />,
      action: '통계 보기',
      href: '/stats',
      color: theme.palette.info.main,
      stats: `${stats.winRate}%`,
      trend: '+5%',
      gradient: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.main, 0.05)})`
    }
  ];

  const quickActions = [
    { label: '클럽 만들기', icon: <Add />, action: () => navigate('/clubs/create'), color: 'primary' },
    { label: '경기 생성', icon: <Sports />, action: () => navigate('/matches/create'), color: 'success' },
    { label: '통계 보기', icon: <Timeline />, action: () => navigate('/stats'), color: 'info' },
    { label: '설정', icon: <Settings />, action: () => navigate('/settings'), color: 'secondary' }
  ];

  const handleCardClick = (href) => {
    navigate(href);
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Header Section with Glassmorphism */}
      <Fade in timeout={600}>
        <Box sx={{
          ...glassmorphism.styles.header,
          p: 4,
          mb: 4,
          borderRadius: '20px',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05), rgba(156, 39, 176, 0.05))',
            zIndex: -1
          }
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  mb: 1,
                  fontSize: { xs: '2rem', md: '2.5rem' }
                }}
              >
                대시보드
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: alpha(theme.palette.text.primary, 0.7),
                  fontWeight: 400,
                  mb: 1
                }}
              >
                환영합니다, {user?.name || '사용자'}님! 👋
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: alpha(theme.palette.text.primary, 0.6),
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <CalendarToday sx={{ fontSize: 16 }} />
                {currentTime.toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <IconButton sx={glassmorphism.styles.quickAction}>
                <Notifications />
              </IconButton>
              <IconButton sx={glassmorphism.styles.quickAction}>
                <Settings />
              </IconButton>
            </Stack>
          </Stack>
        </Box>
      </Fade>

      {/* Stats Overview */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 3,
          }}
        >
          활동 현황
        </Typography>

        <Grid container spacing={3}>
          {[
            { label: '가입 클럽', value: stats.totalClubs, icon: <Group />, color: theme.palette.primary.main, trend: '+2 this week' },
            { label: '예정 경기', value: stats.upcomingMatches, icon: <Sports />, color: theme.palette.success.main, trend: '+1 today' },
            { label: '최근 활동', value: stats.recentActivity, icon: <Timeline />, color: theme.palette.info.main, trend: '+3 this month' },
            { label: '승률', value: `${stats.winRate}%`, icon: <TrendingUp />, color: theme.palette.warning.main, trend: '+5% improved' }
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <Grow in timeout={800 + index * 200}>
                <Card sx={{
                  ...glassmorphism.styles.statsCard,
                  height: '140px',
                  cursor: 'pointer',
                  ...glassmorphism.animations.stagger(index)
                }}>
                  <CardContent sx={{ p: 3, pb: '16px !important', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        background: glassmorphism.glassColors.surface.medium,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${glassmorphism.glassColors.surface.light}`,
                      }}>
                        {React.cloneElement(stat.icon, {
                          sx: { color: stat.color, fontSize: 24 }
                        })}
                      </Box>
                    </Stack>
                    <Box>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          color: theme.palette.text.primary,
                          mb: 0.5,
                          fontSize: '1.8rem'
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: alpha(theme.palette.text.primary, 0.7),
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          mb: 0.5
                        }}
                      >
                        {stat.label}
                      </Typography>
                      <Chip
                        label={stat.trend}
                        size="small"
                        sx={{
                          height: '20px',
                          fontSize: '0.7rem',
                          backgroundColor: alpha(stat.color, 0.1),
                          color: stat.color,
                          border: `1px solid ${alpha(stat.color, 0.2)}`,
                          '& .MuiChip-label': {
                            px: 1
                          }
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Navigation Cards */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 3,
          }}
        >
          주요 메뉴
        </Typography>

        <Grid container spacing={3}>
          {navigationCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={6} lg={3} key={card.id}>
              <Grow in timeout={1000 + index * 200}>
                <Card sx={{
                  ...glassmorphism.styles.navigationCard,
                  height: '200px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  ...glassmorphism.animations.stagger(index),
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: card.gradient,
                    zIndex: 0
                  }
                }} onClick={() => handleCardClick(card.href)}>
                  <CardContent sx={{
                    p: 3,
                    pb: '16px !important',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                        <Box sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '16px',
                          background: glassmorphism.glassColors.surface.strong,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1px solid ${glassmorphism.glassColors.surface.medium}`,
                        }}>
                          {React.cloneElement(card.icon, {
                            sx: { color: card.color, fontSize: 32 }
                          })}
                        </Box>
                        <ArrowForward sx={{
                          color: alpha(theme.palette.text.primary, 0.5),
                          fontSize: 20,
                          transform: 'rotate(-45deg)',
                          transition: 'all 0.3s ease',
                          '.MuiCard-root:hover &': {
                            transform: 'rotate(0deg)',
                            color: theme.palette.text.primary
                          }
                        }} />
                      </Stack>

                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                          mb: 1,
                          fontSize: '1.1rem'
                        }}
                      >
                        {card.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: alpha(theme.palette.text.primary, 0.7),
                          fontSize: '0.875rem',
                          lineHeight: 1.4
                        }}
                      >
                        {card.description}
                      </Typography>
                    </Box>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: card.color,
                          fontSize: '1.5rem'
                        }}
                      >
                        {card.stats}
                      </Typography>
                      <Chip
                        label={card.trend}
                        size="small"
                        icon={<TrendingUp sx={{ fontSize: '12px !important' }} />}
                        sx={{
                          height: '24px',
                          fontSize: '0.75rem',
                          backgroundColor: alpha(card.color, 0.1),
                          color: card.color,
                          border: `1px solid ${alpha(card.color, 0.2)}`,
                          '& .MuiChip-icon': {
                            marginLeft: '4px'
                          }
                        }}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Quick Actions */}
      <Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 3,
          }}
        >
          빠른 실행
        </Typography>

        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid item xs={6} sm={3} key={action.label}>
              <Grow in timeout={1200 + index * 100}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={action.icon}
                  onClick={action.action}
                  sx={{
                    ...glassmorphism.styles.quickAction,
                    p: 2,
                    borderRadius: '12px',
                    height: '80px',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 1 },
                    color: theme.palette[action.color].main,
                    borderColor: alpha(theme.palette[action.color].main, 0.2),
                    ...glassmorphism.animations.stagger(index),
                    '&:hover': {
                      ...glassmorphism.styles.quickAction['&:hover'],
                      borderColor: theme.palette[action.color].main,
                      backgroundColor: alpha(theme.palette[action.color].main, 0.1),
                    },
                    '& .MuiButton-startIcon': {
                      margin: { xs: 0, sm: '0 8px 0 0' }
                    }
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      fontWeight: 500
                    }}
                  >
                    {action.label}
                  </Typography>
                </Button>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;