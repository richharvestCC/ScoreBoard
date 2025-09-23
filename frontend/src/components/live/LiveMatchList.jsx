import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Visibility as ViewIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  SportsScore as ScoreIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import useSocket from '../../hooks/useSocket';
import { liveScoringAPI } from '../../services/api';
import moment from 'moment';

const LiveMatchList = ({ showTitle = true, maxItems = null }) => {
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const [liveMatches, setLiveMatches] = useState([]);
  const [globalStats, setGlobalStats] = useState({ totalLiveMatches: 0, totalViewers: 0 });

  // 라이브 경기 목록 조회
  const { data: matchesData, isLoading, error, refetch } = useQuery({
    queryKey: ['liveMatches'],
    queryFn: () => liveScoringAPI.getLiveMatches().then(res => res.data.data),
    refetchInterval: 30000 // 30초마다 새로고침
  });

  // 초기 데이터 설정
  useEffect(() => {
    if (matchesData) {
      setLiveMatches(matchesData.matches || []);
      setGlobalStats(matchesData.globalStats || { totalLiveMatches: 0, totalViewers: 0 });
    }
  }, [matchesData]);

  // Socket 이벤트 리스너 설정
  useEffect(() => {
    if (!socket) return;

    const handleScoreUpdate = (data) => {
      setLiveMatches(prev => prev.map(match =>
        match.id === data.matchId
          ? { ...match, home_score: data.homeScore, away_score: data.awayScore }
          : match
      ));
    };

    const handleMatchStatusChange = (data) => {
      if (data.status === 'completed') {
        // 경기가 종료되면 목록에서 제거
        setLiveMatches(prev => prev.filter(match => match.id !== data.matchId));
        setGlobalStats(prev => ({
          ...prev,
          totalLiveMatches: Math.max(0, prev.totalLiveMatches - 1)
        }));
      } else {
        setLiveMatches(prev => prev.map(match =>
          match.id === data.matchId
            ? { ...match, status: data.status }
            : match
        ));
      }
    };

    const handleMatchStarted = (data) => {
      // 새로운 라이브 경기가 시작되면 목록에 추가
      const newMatch = {
        ...data.match,
        liveInfo: { viewerCount: 1, managerCount: 1, lastUpdate: new Date() }
      };

      setLiveMatches(prev => {
        const exists = prev.find(match => match.id === data.match.id);
        if (exists) {
          return prev.map(match =>
            match.id === data.match.id ? newMatch : match
          );
        }
        return [newMatch, ...prev];
      });

      setGlobalStats(prev => ({
        ...prev,
        totalLiveMatches: prev.totalLiveMatches + 1,
        totalViewers: prev.totalViewers + 1
      }));
    };

    const handleViewerUpdate = (data) => {
      if (data.viewerCount !== undefined) {
        setLiveMatches(prev => prev.map(match =>
          match.id === data.matchId
            ? {
                ...match,
                liveInfo: {
                  ...match.liveInfo,
                  viewerCount: data.viewerCount
                }
              }
            : match
        ));
      }
    };

    // 글로벌 이벤트 리스너 등록
    socket.on('score-updated', handleScoreUpdate);
    socket.on('match-status-changed', handleMatchStatusChange);
    socket.on('match-started', handleMatchStarted);
    socket.on('match-ended', handleMatchStatusChange);
    socket.on('viewer-joined', handleViewerUpdate);
    socket.on('viewer-left', handleViewerUpdate);

    return () => {
      socket.off('score-updated', handleScoreUpdate);
      socket.off('match-status-changed', handleMatchStatusChange);
      socket.off('match-started', handleMatchStarted);
      socket.off('match-ended', handleMatchStatusChange);
      socket.off('viewer-joined', handleViewerUpdate);
      socket.off('viewer-left', handleViewerUpdate);
    };
  }, [socket]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => refetch()}>
            재시도
          </Button>
        }
      >
        라이브 경기 목록을 불러오는데 실패했습니다.
      </Alert>
    );
  }

  const displayMatches = maxItems ? liveMatches.slice(0, maxItems) : liveMatches;

  return (
    <Box>
      {showTitle && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold">
            라이브 경기
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            {!isConnected && (
              <Chip
                label="연결 끊김"
                color="warning"
                size="small"
              />
            )}
            <Tooltip title="새로고침">
              <IconButton onClick={() => refetch()} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}

      {/* 전체 통계 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="primary">
                {globalStats.totalLiveMatches}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                라이브 경기
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="secondary">
                {globalStats.totalViewers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                총 시청자
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 라이브 경기 목록 */}
      {displayMatches.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              현재 진행 중인 라이브 경기가 없습니다
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <List>
            {displayMatches.map((match, index) => (
              <React.Fragment key={match.id}>
                <ListItem
                  sx={{
                    py: 2,
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                  onClick={() => navigate(`/matches/${match.id}/live`)}
                >
                  <ListItemAvatar>
                    <Box position="relative">
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <ScoreIcon />
                      </Avatar>
                      <Chip
                        label="LIVE"
                        color="error"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          fontSize: '0.7rem',
                          height: 16
                        }}
                      />
                    </Box>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="subtitle1">
                          {match.homeClub?.name} vs {match.awayClub?.name}
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {match.home_score} - {match.away_score}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box display="flex" alignItems="center" gap={2} mt={1}>
                        <Chip
                          label={`${match.liveInfo?.viewerCount || 0} 시청자`}
                          size="small"
                          icon={<PeopleIcon />}
                        />
                        {match.venue && (
                          <Typography variant="caption" color="text.secondary">
                            📍 {match.venue}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {moment(match.match_date).format('HH:mm')}
                        </Typography>
                      </Box>
                    }
                  />

                  <Box display="flex" alignItems="center" gap={1}>
                    <Tooltip title="라이브 보기">
                      <IconButton
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/matches/${match.id}/live`);
                        }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItem>
                {index < displayMatches.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>

          {maxItems && liveMatches.length > maxItems && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/live/matches')}
              >
                모든 라이브 경기 보기 ({liveMatches.length - maxItems}개 더)
              </Button>
            </Box>
          )}
        </Card>
      )}
    </Box>
  );
};

export default LiveMatchList;