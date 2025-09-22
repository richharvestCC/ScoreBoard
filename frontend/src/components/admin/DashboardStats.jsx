import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import {
  People as PeopleIcon,
  EmojiEvents as TrophyIcon,
  Groups as GroupsIcon,
  Sports as SportsIcon,
  TrendingUp as TrendingUpIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';

const DashboardStats = () => {
  const theme = useTheme();

  const {
    data: stats,
    isLoading,
    error
  } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: () => adminAPI.getDashboardStats().then(res => res.data.data),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        통계를 불러오는데 실패했습니다: {error.message}
      </Alert>
    );
  }

  const StatCard = ({ title, value, icon, trend, trendValue, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="text.secondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={`${color}.main`}>
              {value?.toLocaleString() || 0}
            </Typography>
            {trend && (
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUpIcon
                  fontSize="small"
                  color={trendValue > 0 ? 'success' : 'error'}
                  sx={{ mr: 0.5 }}
                />
                <Typography
                  variant="body2"
                  color={trendValue > 0 ? 'success.main' : 'error.main'}
                >
                  {trend}
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: 2,
              p: 2,
              color: `${color}.main`
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const RoleDistributionCard = () => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          사용자 역할 분포
        </Typography>
        <Box sx={{ mt: 2 }}>
          {Object.entries(stats?.users?.byRole || {}).map(([role, count]) => {
            const roleLabels = {
              user: '일반 사용자',
              organizer: '주최자',
              moderator: '운영자',
              admin: '관리자'
            };

            const percentage = stats?.users?.total > 0
              ? ((count / stats.users.total) * 100).toFixed(1)
              : 0;

            return (
              <Box key={role} sx={{ mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">
                    {roleLabels[role] || role}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {count} ({percentage}%)
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: '100%',
                    height: 8,
                    backgroundColor: theme.palette.grey[200],
                    borderRadius: 1,
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: theme.palette.primary.main,
                      transition: 'width 0.3s ease'
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );

  const CompetitionStatusCard = () => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          대회 상태 분포
        </Typography>
        <Box sx={{ mt: 2 }}>
          {Object.entries(stats?.competitions?.byStatus || {}).map(([status, count]) => {
            const statusLabels = {
              draft: '초안',
              open_registration: '신청중',
              registration_closed: '신청마감',
              in_progress: '진행중',
              completed: '완료',
              cancelled: '취소'
            };

            const statusColors = {
              draft: 'grey',
              open_registration: 'success',
              registration_closed: 'warning',
              in_progress: 'info',
              completed: 'primary',
              cancelled: 'error'
            };

            return (
              <Box key={status} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2">
                  {statusLabels[status] || status}
                </Typography>
                <Box display="flex" alignItems="center">
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    {count}
                  </Typography>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: theme.palette[statusColors[status]]?.main || theme.palette.grey[400]
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        대시보드 통계
      </Typography>

      <Grid container spacing={3}>
        {/* Main Stats */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="전체 사용자"
            value={stats?.users?.total}
            icon={<PeopleIcon />}
            trend={`최근 7일: +${stats?.users?.recent || 0}`}
            trendValue={stats?.users?.recent || 0}
            color="primary"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="활성 사용자"
            value={stats?.users?.active}
            icon={<PersonAddIcon />}
            trend={`전체 사용자의 ${stats?.users?.total > 0 ? ((stats?.users?.active / stats?.users?.total) * 100).toFixed(1) : 0}%`}
            trendValue={stats?.users?.active}
            color="success"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="전체 대회"
            value={stats?.competitions?.total}
            icon={<TrophyIcon />}
            trend={`최근 7일: +${stats?.competitions?.recent || 0}`}
            trendValue={stats?.competitions?.recent || 0}
            color="secondary"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="활성 대회"
            value={stats?.competitions?.active}
            icon={<SportsIcon />}
            trend={`전체 대회의 ${stats?.competitions?.total > 0 ? ((stats?.competitions?.active / stats?.competitions?.total) * 100).toFixed(1) : 0}%`}
            trendValue={stats?.competitions?.active}
            color="info"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="전체 클럽"
            value={stats?.clubs?.total}
            icon={<GroupsIcon />}
            color="warning"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="전체 경기"
            value={stats?.matches?.total}
            icon={<SportsIcon />}
            color="error"
          />
        </Grid>

        {/* Detailed Charts */}
        <Grid item xs={12} md={6}>
          <RoleDistributionCard />
        </Grid>

        <Grid item xs={12} md={6}>
          <CompetitionStatusCard />
        </Grid>
      </Grid>
    </>
  );
};

export default DashboardStats;