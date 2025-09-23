import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  Sports,
  EmojiEvents,
  TrendingUp,
  Schedule,
  CheckCircle,
  PlayArrow
} from '@mui/icons-material';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'primary' }) => (
  <Card elevation={2} sx={{ height: '100%' }}>
    <CardContent sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Icon sx={{ color: `${color}.main`, fontSize: 20 }} />
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: `${color}.main`, mb: 0.5 }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const LeagueStatistics = ({ statistics, loading = false }) => {
  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>통계를 불러오는 중...</Typography>
      </Box>
    );
  }

  if (!statistics) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>통계 데이터가 없습니다.</Typography>
      </Box>
    );
  }

  const { competition_info, match_statistics } = statistics;

  // 진행률 계산
  const progressPercentage = match_statistics.total_matches > 0
    ? Math.round((match_statistics.completed_matches / match_statistics.total_matches) * 100)
    : 0;

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" component="h3" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp color="primary" />
          리그 통계
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Chip
            label={competition_info.name}
            color="primary"
            variant="outlined"
            size="small"
          />
          <Chip
            label={`${competition_info.season} 시즌`}
            color="secondary"
            variant="outlined"
            size="small"
          />
          <Chip
            label={competition_info.status === 'active' ? '진행 중' : competition_info.status}
            color={competition_info.status === 'active' ? 'success' : 'default'}
            size="small"
          />
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="전체 경기"
            value={match_statistics.total_matches}
            subtitle="예정된 총 경기 수"
            icon={Sports}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="완료된 경기"
            value={match_statistics.completed_matches}
            subtitle={`${progressPercentage}% 진행`}
            icon={CheckCircle}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="예정된 경기"
            value={match_statistics.upcoming_matches}
            subtitle="남은 경기 수"
            icon={Schedule}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="총 득점"
            value={match_statistics.total_goals}
            subtitle={`경기당 평균 ${match_statistics.average_goals_per_game}골`}
            icon={EmojiEvents}
            color="error"
          />
        </Grid>
      </Grid>

      {/* 시즌 진행률 */}
      <Card elevation={1} sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <PlayArrow sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              시즌 진행률
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 40 }}>
              {progressPercentage}%
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {match_statistics.completed_matches} / {match_statistics.total_matches} 경기 완료
          </Typography>
        </CardContent>
      </Card>

      {/* 득점 통계 상세 */}
      {match_statistics.completed_matches > 0 && (
        <Card elevation={1}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
              득점 분석
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  총 득점
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {match_statistics.total_goals}골
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  경기당 평균
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {match_statistics.average_goals_per_game}골
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Paper>
  );
};

export default LeagueStatistics;