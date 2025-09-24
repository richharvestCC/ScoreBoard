import React from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  Avatar,
  Chip,
  Divider,
  Grid
} from '@mui/material';
import {
  Schedule,
  CheckCircle,
  Sports
} from '@mui/icons-material';

const MatchItem = ({ match, isUpcoming = false }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return `오늘 ${date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`;
    }

    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getResultColor = (result) => {
    switch (result) {
      case 'home_win': return 'success';
      case 'away_win': return 'error';
      case 'draw': return 'warning';
      default: return 'default';
    }
  };

  const getResultText = (result) => {
    switch (result) {
      case 'home_win': return '홈 승리';
      case 'away_win': return '원정 승리';
      case 'draw': return '무승부';
      default: return '';
    }
  };

  return (
    <ListItem sx={{ px: 0, py: 1 }}>
      <Box sx={{ width: '100%' }}>
        <Grid container spacing={2} alignItems="center">
          {/* 날짜/시간 */}
          <Grid item xs={12} sm={3}>
            <Typography variant="caption" color="text.secondary">
              {formatDate(match.match_date)}
            </Typography>
            {match.venue && (
              <Typography variant="caption" color="text.secondary" display="block">
                {match.venue}
              </Typography>
            )}
          </Grid>

          {/* 팀 정보 */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* 홈팀 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                <Avatar
                  src={match.home_club.logo_url}
                  sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                >
                  {match.home_club.name.charAt(0)}
                </Avatar>
                <Typography variant="body2" noWrap>
                  {match.home_club.name}
                </Typography>
              </Box>

              {/* 스코어 또는 VS */}
              <Box sx={{ mx: 2, textAlign: 'center', minWidth: 60 }}>
                {isUpcoming ? (
                  <Typography variant="body2" color="text.secondary">
                    VS
                  </Typography>
                ) : (
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {match.home_score} : {match.away_score}
                  </Typography>
                )}
              </Box>

              {/* 원정팀 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, justifyContent: 'flex-end' }}>
                <Typography variant="body2" noWrap>
                  {match.away_club.name}
                </Typography>
                <Avatar
                  src={match.away_club.logo_url}
                  sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                >
                  {match.away_club.name.charAt(0)}
                </Avatar>
              </Box>
            </Box>
          </Grid>

          {/* 결과 또는 상태 */}
          <Grid item xs={12} sm={3}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              {isUpcoming ? (
                <Chip
                  label="예정"
                  size="small"
                  color="primary"
                  variant="outlined"
                  icon={<Schedule />}
                />
              ) : (
                <Chip
                  label={getResultText(match.result)}
                  size="small"
                  color={getResultColor(match.result)}
                  icon={<CheckCircle />}
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </ListItem>
  );
};

const MatchList = ({ matches, title, loading = false, isUpcoming = false }) => {
  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>경기 목록을 불러오는 중...</Typography>
      </Box>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
        <Sports sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography color="text.secondary">
          {isUpcoming ? '예정된 경기가 없습니다.' : '경기 결과가 없습니다.'}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ overflow: 'hidden' }}>
      <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" component="h3">
          {title}
        </Typography>
      </Box>

      <List sx={{ p: 0 }}>
        {matches.map((match, index) => (
          <React.Fragment key={match.id}>
            <MatchItem match={match} isUpcoming={isUpcoming} />
            {index < matches.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default MatchList;