import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
} from '@mui/material';
import {
  Group,
  Sports,
  Timeline,
  Add,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const dashboardCards = [
    {
      title: '내 클럽',
      description: '가입한 클럽 및 팀 관리',
      icon: <Group />,
      action: '클럽 보기',
      href: '/clubs',
    },
    {
      title: '경기 일정',
      description: '예정된 경기 및 결과',
      icon: <Sports />,
      action: '경기 보기',
      href: '/matches',
    },
    {
      title: '통계',
      description: '개인 및 팀 통계',
      icon: <Timeline />,
      action: '통계 보기',
      href: '/stats',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          대시보드
        </Typography>
        <Typography variant="h6" color="text.secondary">
          환영합니다, {user?.name}님!
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {dashboardCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 3,
                },
              }}
              onClick={() => navigate(card.href)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {card.icon}
                  <Typography variant="h6" component="h2" sx={{ ml: 1 }}>
                    {card.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {card.description}
                </Typography>
                <Button variant="outlined" fullWidth>
                  {card.action}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            빠른 시작
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/clubs/create')}
            >
              클럽 만들기
            </Button>
            <Button
              variant="outlined"
              startIcon={<Sports />}
              onClick={() => navigate('/matches/create')}
            >
              경기 만들기
            </Button>
          </Box>
        </Paper>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            최근 활동
          </Typography>
          <Typography variant="body2" color="text.secondary">
            아직 활동이 없습니다. 클럽에 가입하거나 경기를 만들어보세요!
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;