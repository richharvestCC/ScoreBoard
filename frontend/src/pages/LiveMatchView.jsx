import React from 'react';
import {
  Container,
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Alert,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { matchAPI, liveScoringAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import LiveScoreboard from '../components/live/LiveScoreboard';
import LiveMatchList from '../components/live/LiveMatchList';

const LiveMatchView = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // 경기 정보 조회
  const { data: matchData, isLoading: matchLoading } = useQuery({
    queryKey: ['match', matchId],
    queryFn: () => matchAPI.getById(matchId).then(res => res.data.data),
    enabled: !!matchId
  });

  // 라이브 경기 정보 조회
  const { data: liveData } = useQuery({
    queryKey: ['liveMatch', matchId],
    queryFn: () => liveScoringAPI.getLiveMatchInfo(matchId).then(res => res.data.data),
    enabled: !!matchId
  });

  // 관리자 권한 확인
  const isManager = user && (
    ['admin', 'moderator', 'organizer'].includes(user.role) ||
    matchData?.created_by === user.id
  );

  if (matchLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center">
          <Typography>로딩 중...</Typography>
        </Box>
      </Container>
    );
  }

  if (!matchData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          경기를 찾을 수 없습니다.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 브레드크럼 */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          color="inherit"
          onClick={() => navigate('/matches')}
          sx={{ cursor: 'pointer' }}
        >
          경기 목록
        </Link>
        <Link
          color="inherit"
          onClick={() => navigate(`/matches/${matchId}`)}
          sx={{ cursor: 'pointer' }}
        >
          경기 상세
        </Link>
        <Typography color="text.primary">라이브 뷰</Typography>
      </Breadcrumbs>

      {/* 헤더 */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          라이브 경기
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {matchData.homeClub?.name} vs {matchData.awayClub?.name}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* 메인 라이브 스코어보드 */}
        <Grid item xs={12} lg={8}>
          <LiveScoreboard
            matchId={matchId}
            isManager={isManager}
          />
        </Grid>

        {/* 사이드바 - 다른 라이브 경기 */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                다른 라이브 경기
              </Typography>
              <LiveMatchList
                showTitle={false}
                maxItems={5}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LiveMatchView;