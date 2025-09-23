import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Breadcrumbs,
  Link,
  Chip
} from '@mui/material';
import {
  Home,
  EmojiEvents,
  Refresh,
  ArrowBack
} from '@mui/icons-material';

import LeagueStandings from '../components/league/LeagueStandings';
import LeagueStatistics from '../components/league/LeagueStatistics';
import MatchList from '../components/league/MatchList';
import { useLeagueDashboard, useInvalidateLeagueData } from '../hooks/useLeague';

const LeagueDashboard = () => {
  const { competitionId } = useParams();
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching
  } = useLeagueDashboard(competitionId);

  const { invalidateDashboard } = useInvalidateLeagueData();

  // 자동 새로고침 상태 관리
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        invalidateDashboard(competitionId);
      }, 5 * 60 * 1000); // 5분마다 새로고침

      return () => clearInterval(interval);
    }
  }, [autoRefresh, competitionId, invalidateDashboard]);

  const handleRefresh = async () => {
    try {
      await refetch();
      setSnackbar({
        open: true,
        message: '대시보드가 새로고침되었습니다.',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: '새로고침 중 오류가 발생했습니다.',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography color="text.secondary">
              리그 대시보드를 불러오는 중...
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              다시 시도
            </Button>
          }
        >
          {error?.response?.data?.message || '리그 대시보드를 불러오는 중 오류가 발생했습니다.'}
        </Alert>
      </Container>
    );
  }

  const { standings, statistics, recent_matches, upcoming_matches, last_updated } = dashboardData?.data || {};

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* 헤더 영역 */}
      <Box sx={{ mb: 3 }}>
        {/* 브레드크럼 */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            color="inherit"
            href="/"
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <Home sx={{ mr: 0.5, fontSize: 'inherit' }} />
            홈
          </Link>
          <Link
            color="inherit"
            href="/tournaments"
            sx={{ textDecoration: 'none' }}
          >
            대회
          </Link>
          <Typography color="text.primary">리그 대시보드</Typography>
        </Breadcrumbs>

        {/* 제목 및 컨트롤 */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/tournaments')}
              variant="outlined"
              size="small"
            >
              돌아가기
            </Button>
            <Box>
              <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmojiEvents color="primary" />
                리그 대시보드
              </Typography>
              {statistics?.competition_info && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Chip
                    label={statistics.competition_info.name}
                    color="primary"
                    size="small"
                  />
                  <Chip
                    label={`${statistics.competition_info.season} 시즌`}
                    color="secondary"
                    variant="outlined"
                    size="small"
                  />
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={isRefetching}
              variant="outlined"
              size="small"
            >
              {isRefetching ? '새로고침 중...' : '새로고침'}
            </Button>
          </Box>
        </Box>

        {/* 마지막 업데이트 시간 */}
        {last_updated && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            마지막 업데이트: {new Date(last_updated).toLocaleString('ko-KR')}
          </Typography>
        )}
      </Box>

      {/* 대시보드 콘텐츠 */}
      <Grid container spacing={3}>
        {/* 통계 카드 */}
        {statistics && (
          <Grid item xs={12}>
            <LeagueStatistics statistics={statistics} />
          </Grid>
        )}

        {/* 순위표 */}
        {standings && (
          <Grid item xs={12} lg={8}>
            <LeagueStandings standings={standings} />
          </Grid>
        )}

        {/* 최근 경기 및 다음 경기 */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={2}>
            {/* 최근 경기 */}
            {recent_matches && recent_matches.length > 0 && (
              <Grid item xs={12}>
                <MatchList
                  matches={recent_matches}
                  title="최근 경기"
                  isUpcoming={false}
                />
              </Grid>
            )}

            {/* 다음 경기 */}
            {upcoming_matches && upcoming_matches.length > 0 && (
              <Grid item xs={12}>
                <MatchList
                  matches={upcoming_matches}
                  title="다음 경기"
                  isUpcoming={true}
                />
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* 대시보드가 비어있는 경우 */}
        {!statistics && !standings && !recent_matches?.length && !upcoming_matches?.length && (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <EmojiEvents sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  대시보드 데이터가 없습니다
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  아직 진행된 경기나 통계가 없습니다.
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleRefresh}
                  startIcon={<Refresh />}
                >
                  다시 불러오기
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* 스낵바 알림 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LeagueDashboard;