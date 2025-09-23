import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Avatar,
  Divider,
  Alert,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Edit as EditIcon,
  Add as AddIcon,
  People as PeopleIcon,
  Visibility as ViewIcon,
  AccessTime as TimeIcon,
  SportsScore as ScoreIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useSocket from '../../hooks/useSocket';
import { liveScoringAPI } from '../../services/api';
import moment from 'moment';

const LiveScoreboard = ({ matchId, isManager = false }) => {
  const queryClient = useQueryClient();
  const { socket, isConnected, joinMatch, leaveMatch, updateScore, addMatchEvent, changeMatchStatus } = useSocket();

  const [matchData, setMatchData] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [events, setEvents] = useState([]);

  // 관리자 다이얼로그 상태
  const [scoreDialog, setScoreDialog] = useState(false);
  const [eventDialog, setEventDialog] = useState(false);
  const [scoreForm, setScoreForm] = useState({ homeScore: 0, awayScore: 0, minute: '' });
  const [eventForm, setEventForm] = useState({
    eventType: 'goal',
    minute: '',
    clubId: '',
    description: ''
  });

  // 경기 정보 조회
  const { data: initialMatchData, isLoading } = useQuery({
    queryKey: ['liveMatch', matchId],
    queryFn: () => liveScoringAPI.getLiveMatchInfo(matchId).then(res => res.data.data),
    enabled: !!matchId
  });

  // 경기 시작 mutation
  const startMatchMutation = useMutation({
    mutationFn: () => liveScoringAPI.startLiveMatch(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries(['liveMatch', matchId]);
    }
  });

  // 경기 종료 mutation
  const endMatchMutation = useMutation({
    mutationFn: () => liveScoringAPI.endLiveMatch(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries(['liveMatch', matchId]);
    }
  });

  // Socket 이벤트 리스너 설정
  useEffect(() => {
    if (!socket || !matchId) return;

    // 경기 룸 참여
    joinMatch(matchId);

    // Socket 이벤트 리스너
    const handleMatchJoined = (data) => {
      setMatchData(data.match);
      setViewerCount(data.viewerCount);
      setIsLive(data.match.status === 'in_progress');
    };

    const handleScoreUpdate = (data) => {
      setMatchData(prev => ({
        ...prev,
        home_score: data.homeScore,
        away_score: data.awayScore
      }));
    };

    const handleMatchEvent = (data) => {
      setEvents(prev => [...prev, data.event]);
    };

    const handleMatchStatusChange = (data) => {
      setMatchData(prev => ({
        ...prev,
        status: data.status
      }));
      setIsLive(data.status === 'in_progress');
    };

    const handleViewerUpdate = (data) => {
      setViewerCount(data.viewerCount);
    };

    const handleMatchStarted = (data) => {
      setMatchData(data.match);
      setIsLive(true);
    };

    const handleMatchEnded = (data) => {
      setIsLive(false);
      setMatchData(prev => ({
        ...prev,
        status: 'completed'
      }));
    };

    // 이벤트 리스너 등록
    socket.on('match-joined', handleMatchJoined);
    socket.on('score-updated', handleScoreUpdate);
    socket.on('match-event-added', handleMatchEvent);
    socket.on('match-status-changed', handleMatchStatusChange);
    socket.on('viewer-joined', handleViewerUpdate);
    socket.on('viewer-left', handleViewerUpdate);
    socket.on('match-started', handleMatchStarted);
    socket.on('match-ended', handleMatchEnded);

    return () => {
      // 이벤트 리스너 제거
      socket.off('match-joined', handleMatchJoined);
      socket.off('score-updated', handleScoreUpdate);
      socket.off('match-event-added', handleMatchEvent);
      socket.off('match-status-changed', handleMatchStatusChange);
      socket.off('viewer-joined', handleViewerUpdate);
      socket.off('viewer-left', handleViewerUpdate);
      socket.off('match-started', handleMatchStarted);
      socket.off('match-ended', handleMatchEnded);

      // 경기 룸 떠나기
      leaveMatch(matchId);
    };
  }, [socket, matchId, joinMatch, leaveMatch]);

  // 초기 데이터 설정
  useEffect(() => {
    if (initialMatchData) {
      setMatchData(initialMatchData.match);
      setViewerCount(initialMatchData.liveInfo?.viewerCount || 0);
      setIsLive(initialMatchData.match.status === 'in_progress');
      setEvents(initialMatchData.match.events || []);
    }
  }, [initialMatchData]);

  // 스코어 업데이트 핸들러
  const handleScoreUpdate = () => {
    if (!scoreForm.homeScore && scoreForm.homeScore !== 0) return;
    if (!scoreForm.awayScore && scoreForm.awayScore !== 0) return;

    updateScore(
      matchId,
      parseInt(scoreForm.homeScore),
      parseInt(scoreForm.awayScore),
      scoreForm.minute ? parseInt(scoreForm.minute) : null
    );
    setScoreDialog(false);
  };

  // 이벤트 추가 핸들러
  const handleAddEvent = () => {
    if (!eventForm.eventType || !eventForm.minute) return;

    addMatchEvent(matchId, eventForm.eventType, {
      minute: parseInt(eventForm.minute),
      clubId: eventForm.clubId || null,
      description: eventForm.description
    });
    setEventDialog(false);
    setEventForm({
      eventType: 'goal',
      minute: '',
      clubId: '',
      description: ''
    });
  };

  // 경기 시작 핸들러
  const handleStartMatch = () => {
    startMatchMutation.mutate();
  };

  // 경기 종료 핸들러
  const handleEndMatch = () => {
    endMatchMutation.mutate();
  };

  // 스코어 폼 초기화
  const openScoreDialog = () => {
    setScoreForm({
      homeScore: matchData?.home_score || 0,
      awayScore: matchData?.away_score || 0,
      minute: ''
    });
    setScoreDialog(true);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <LinearProgress sx={{ width: '100%' }} />
      </Box>
    );
  }

  if (!matchData) {
    return (
      <Alert severity="error">
        경기 정보를 불러올 수 없습니다.
      </Alert>
    );
  }

  const eventTypeLabels = {
    goal: '골',
    yellow_card: '경고',
    red_card: '퇴장',
    substitution: '교체',
    corner: '코너킥',
    foul: '파울',
    offside: '오프사이드'
  };

  return (
    <Box>
      {/* 연결 상태 표시 */}
      {!isConnected && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          실시간 연결이 끊어졌습니다. 새로고침을 시도해주세요.
        </Alert>
      )}

      {/* 메인 스코어보드 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          {/* 상태 및 시청자 정보 */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Chip
                label={isLive ? 'LIVE' : matchData.status}
                color={isLive ? 'error' : 'default'}
                size="small"
                icon={isLive ? <PlayIcon /> : undefined}
              />
              {isLive && (
                <Chip
                  label={`${viewerCount} 시청자`}
                  size="small"
                  icon={<PeopleIcon />}
                />
              )}
            </Box>

            {isManager && (
              <Box display="flex" gap={1}>
                {matchData.status === 'scheduled' && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<PlayIcon />}
                    onClick={handleStartMatch}
                    disabled={startMatchMutation.isLoading}
                  >
                    경기 시작
                  </Button>
                )}
                {isLive && (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={openScoreDialog}
                    >
                      점수 수정
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => setEventDialog(true)}
                    >
                      이벤트 추가
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<StopIcon />}
                      onClick={handleEndMatch}
                      disabled={endMatchMutation.isLoading}
                    >
                      경기 종료
                    </Button>
                  </>
                )}
              </Box>
            )}
          </Box>

          {/* 팀 정보 및 스코어 */}
          <Grid container spacing={3} alignItems="center">
            {/* 홈팀 */}
            <Grid item xs={4}>
              <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
                <Avatar
                  src={matchData.homeClub?.logo_url}
                  sx={{ width: 80, height: 80, mb: 1 }}
                >
                  {matchData.homeClub?.name?.charAt(0)}
                </Avatar>
                <Typography variant="h6" textAlign="center">
                  {matchData.homeClub?.name}
                </Typography>
              </Box>
            </Grid>

            {/* 스코어 */}
            <Grid item xs={4}>
              <Box textAlign="center">
                <Typography variant="h2" fontWeight="bold" color="primary">
                  {matchData.home_score} - {matchData.away_score}
                </Typography>
                {matchData.match_date && (
                  <Typography variant="body2" color="text.secondary">
                    {moment(matchData.match_date).format('YYYY-MM-DD HH:mm')}
                  </Typography>
                )}
                {matchData.venue && (
                  <Typography variant="body2" color="text.secondary">
                    📍 {matchData.venue}
                  </Typography>
                )}
              </Box>
            </Grid>

            {/* 원정팀 */}
            <Grid item xs={4}>
              <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
                <Avatar
                  src={matchData.awayClub?.logo_url}
                  sx={{ width: 80, height: 80, mb: 1 }}
                >
                  {matchData.awayClub?.name?.charAt(0)}
                </Avatar>
                <Typography variant="h6" textAlign="center">
                  {matchData.awayClub?.name}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 경기 이벤트 타임라인 */}
      {events.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              경기 이벤트
            </Typography>
            <Box>
              {events
                .sort((a, b) => b.minute - a.minute)
                .map((event, index) => (
                  <Box key={event.id || index}>
                    <Box display="flex" alignItems="center" gap={2} py={1}>
                      <Chip
                        label={`${event.minute}'`}
                        size="small"
                        color="primary"
                      />
                      <Chip
                        label={eventTypeLabels[event.event_type] || event.event_type}
                        size="small"
                        color={event.event_type === 'goal' ? 'success' :
                               event.event_type === 'red_card' ? 'error' :
                               event.event_type === 'yellow_card' ? 'warning' : 'default'}
                      />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {event.description}
                      </Typography>
                    </Box>
                    {index < events.length - 1 && <Divider />}
                  </Box>
                ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 스코어 수정 다이얼로그 */}
      <Dialog open={scoreDialog} onClose={() => setScoreDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>스코어 수정</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={`${matchData.homeClub?.name} 득점`}
                  type="number"
                  value={scoreForm.homeScore}
                  onChange={(e) => setScoreForm(prev => ({ ...prev, homeScore: e.target.value }))}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={`${matchData.awayClub?.name} 득점`}
                  type="number"
                  value={scoreForm.awayScore}
                  onChange={(e) => setScoreForm(prev => ({ ...prev, awayScore: e.target.value }))}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="분 (선택사항)"
                  type="number"
                  value={scoreForm.minute}
                  onChange={(e) => setScoreForm(prev => ({ ...prev, minute: e.target.value }))}
                  inputProps={{ min: 0, max: 120 }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScoreDialog(false)}>취소</Button>
          <Button onClick={handleScoreUpdate} variant="contained">수정</Button>
        </DialogActions>
      </Dialog>

      {/* 이벤트 추가 다이얼로그 */}
      <Dialog open={eventDialog} onClose={() => setEventDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>경기 이벤트 추가</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  select
                  label="이벤트 타입"
                  value={eventForm.eventType}
                  onChange={(e) => setEventForm(prev => ({ ...prev, eventType: e.target.value }))}
                >
                  {Object.entries(eventTypeLabels).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="분"
                  type="number"
                  value={eventForm.minute}
                  onChange={(e) => setEventForm(prev => ({ ...prev, minute: e.target.value }))}
                  inputProps={{ min: 0, max: 120 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="팀 (선택사항)"
                  value={eventForm.clubId}
                  onChange={(e) => setEventForm(prev => ({ ...prev, clubId: e.target.value }))}
                >
                  <MenuItem value="">없음</MenuItem>
                  <MenuItem value={matchData.home_club_id}>{matchData.homeClub?.name}</MenuItem>
                  <MenuItem value={matchData.away_club_id}>{matchData.awayClub?.name}</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="설명"
                  multiline
                  rows={2}
                  value={eventForm.description}
                  onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventDialog(false)}>취소</Button>
          <Button onClick={handleAddEvent} variant="contained">추가</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LiveScoreboard;