import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider
} from '@mui/material';
import {
  EmojiEvents,
  Schedule,
  CheckCircle,
  Remove as VsIcon
} from '@mui/icons-material';

const MatchCard = ({ match, showDate = true }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'scheduled': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'in_progress': return <Schedule />;
      case 'scheduled': return <Schedule />;
      default: return <Schedule />;
    }
  };

  const getWinnerStyle = (team, isHome) => {
    if (match.status !== 'completed') return {};

    const homeScore = match.home_score || 0;
    const awayScore = match.away_score || 0;
    const isWinner = isHome ? homeScore > awayScore : awayScore > homeScore;

    return isWinner ? {
      backgroundColor: 'success.50',
      border: 2,
      borderColor: 'success.main'
    } : {};
  };

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 1,
        minWidth: 250,
        '&:hover': { elevation: 2 }
      }}
    >
      <CardContent sx={{ p: 2 }}>
        {/* 경기 헤더 */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {match.round_type === 'group' ? match.group_name : `Round ${match.round}`}
          </Typography>
          <Chip
            size="small"
            label={match.status === 'completed' ? '완료' : match.status === 'in_progress' ? '진행중' : '예정'}
            color={getStatusColor(match.status)}
            icon={getStatusIcon(match.status)}
          />
        </Box>

        {/* 팀 vs 팀 */}
        <Grid container spacing={1} alignItems="center">
          {/* 홈팀 */}
          <Grid item xs={5}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 1,
                borderRadius: 1,
                ...getWinnerStyle(match.home_team, true)
              }}
            >
              <Avatar
                src={match.home_team?.logo_url}
                sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}
              >
                {match.home_team?.name?.charAt(0)}
              </Avatar>
              <Typography variant="body2" noWrap>
                {match.home_team?.name || 'TBD'}
              </Typography>
            </Box>
          </Grid>

          {/* 스코어 또는 VS */}
          <Grid item xs={2}>
            <Box sx={{ textAlign: 'center' }}>
              {match.status === 'completed' ? (
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {match.home_score}:{match.away_score}
                </Typography>
              ) : (
                <VsIcon color="action" />
              )}
            </Box>
          </Grid>

          {/* 원정팀 */}
          <Grid item xs={5}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                p: 1,
                borderRadius: 1,
                ...getWinnerStyle(match.away_team, false)
              }}
            >
              <Typography variant="body2" noWrap sx={{ mr: 1 }}>
                {match.away_team?.name || 'TBD'}
              </Typography>
              <Avatar
                src={match.away_team?.logo_url}
                sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
              >
                {match.away_team?.name?.charAt(0)}
              </Avatar>
            </Box>
          </Grid>
        </Grid>

        {/* 경기 날짜 */}
        {showDate && match.match_date && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {new Date(match.match_date).toLocaleDateString('ko-KR', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const RoundColumn = ({ round, roundName }) => (
  <Box sx={{ minWidth: 260, mr: 2 }}>
    <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
      {roundName}
    </Typography>
    {round.map((match, index) => (
      <MatchCard key={match.id || index} match={match} />
    ))}
  </Box>
);

const TournamentBracket = ({ bracket, loading = false }) => {
  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>대진표를 불러오는 중...</Typography>
      </Box>
    );
  }

  if (!bracket || !bracket.rounds) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <EmojiEvents sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          대진표가 없습니다
        </Typography>
        <Typography color="text.secondary">
          아직 대진표가 생성되지 않았습니다.
        </Typography>
      </Paper>
    );
  }

  // 라운드별로 경기 그룹화
  const rounds = {};
  Object.entries(bracket.rounds).forEach(([key, matches]) => {
    if (key.startsWith('group_')) {
      // 그룹 스테이지
      const groupName = key.replace('group_', '');
      if (!rounds[groupName]) {
        rounds[groupName] = [];
      }
      rounds[groupName] = matches;
    } else {
      // 일반 토너먼트 라운드
      rounds[key] = matches;
    }
  });

  const isKnockout = Object.keys(rounds).some(key => !isNaN(key));
  const isGroupStage = Object.keys(rounds).some(key => key.startsWith('Group'));

  return (
    <Paper sx={{ p: 2, overflow: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <EmojiEvents color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6">
          토너먼트 대진표
        </Typography>
      </Box>

      {isGroupStage ? (
        // 그룹 스테이지 표시
        <Box>
          <Typography variant="h6" gutterBottom>
            그룹 스테이지
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(rounds).filter(([key]) => key.startsWith('Group')).map(([groupName, matches]) => (
              <Grid item xs={12} md={6} lg={4} key={groupName}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ textAlign: 'center' }}>
                    {groupName}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {matches.map((match, index) => (
                    <MatchCard key={match.id || index} match={match} showDate={false} />
                  ))}
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* 녹아웃 스테이지가 있다면 표시 */}
          {Object.keys(rounds).some(key => !isNaN(key) || !key.startsWith('Group')) && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                녹아웃 스테이지
              </Typography>
              <Box sx={{ display: 'flex', overflowX: 'auto', pb: 2 }}>
                {Object.entries(rounds)
                  .filter(([key]) => !key.startsWith('Group'))
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([roundNumber, matches]) => (
                    <RoundColumn
                      key={roundNumber}
                      round={matches}
                      roundName={`Round ${roundNumber}`}
                    />
                  ))
                }
              </Box>
            </Box>
          )}
        </Box>
      ) : isKnockout ? (
        // 녹아웃 토너먼트 표시
        <Box sx={{ display: 'flex', overflowX: 'auto', pb: 2 }}>
          {Object.entries(rounds)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([roundNumber, matches]) => {
              const roundNames = {
                '1': '1라운드',
                '2': '2라운드',
                '3': '준준결승',
                '4': '준결승',
                '5': '결승'
              };

              return (
                <RoundColumn
                  key={roundNumber}
                  round={matches}
                  roundName={roundNames[roundNumber] || `Round ${roundNumber}`}
                />
              );
            })
          }
        </Box>
      ) : (
        // 리그전 표시
        <Box>
          {Object.entries(rounds).map(([roundNumber, matches]) => (
            <Box key={roundNumber} sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {roundNumber}라운드
              </Typography>
              <Grid container spacing={2}>
                {matches.map((match, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={match.id || index}>
                    <MatchCard match={match} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Box>
      )}

      {/* 통계 정보 */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          총 경기 수: {bracket.total_matches}
          {bracket.total_teams && ` • 참가 팀 수: ${bracket.total_teams}`}
        </Typography>
      </Box>
    </Paper>
  );
};

export default TournamentBracket;