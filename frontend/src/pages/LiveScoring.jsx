import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Paper,
  Divider,
  Stack
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Pause as PauseIcon,
  Sports as GoalIcon,
  PersonAdd as SubstitutionIcon,
  Warning as CardIcon,
  Flag as OfflineIcon,
  Timer as TimerIcon,
  Add as AddIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchAPI } from '../services/api';
import { getMatchTypeLabel, getStatusLabel, getEventIcon } from '../utils/matchUtils';

const LiveScoring = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [isMatchRunning, setIsMatchRunning] = useState(false);
  const [eventData, setEventData] = useState({
    event_type: 'GOAL',
    team_side: 'home',
    player_id: '',
    minute: 0,
    extra_time_minute: 0,
    description: '',
    related_player_id: ''
  });

  // Match data query
  const {
    data: match,
    isLoading: matchLoading,
    isError: matchError
  } = useQuery({
    queryKey: ['match', id],
    queryFn: () => matchAPI.getById(id),
    select: (response) => response.data.data
  });

  // Match events query
  const {
    data: events,
    isLoading: eventsLoading
  } = useQuery({
    queryKey: ['match-events', id],
    queryFn: () => matchAPI.getEvents(id),
    select: (response) => response.data.data || [],
    enabled: !!id,
    refetchInterval: isMatchRunning ? 5000 : false
  });

  // Add event mutation
  const addEventMutation = useMutation({
    mutationFn: (eventData) => matchAPI.addEvent(id, eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match-events', id] });
      queryClient.invalidateQueries({ queryKey: ['match', id] });
      setEventDialogOpen(false);
      resetEventForm();
    }
  });

  // Timer effect
  useEffect(() => {
    let interval;
    if (isMatchRunning && match?.status === 'in_progress') {
      interval = setInterval(() => {
        setCurrentMinute(prev => prev + 1);
      }, 60000); // 1 minute intervals
    }
    return () => clearInterval(interval);
  }, [isMatchRunning, match?.status]);

  const handleStartMatch = async () => {
    if (match?.status === 'scheduled') {
      // Add match start event
      await addEventMutation.mutateAsync({
        event_type: 'MATCH_START',
        minute: 0,
        sequence_number: events.length + 1
      });
    }
    setIsMatchRunning(true);
  };

  const handlePauseMatch = () => {
    setIsMatchRunning(false);
  };

  const handleEndMatch = async () => {
    setIsMatchRunning(false);
    // Add match end event
    await addEventMutation.mutateAsync({
      event_type: 'MATCH_END',
      minute: currentMinute,
      sequence_number: events.length + 1
    });
  };

  const handleAddEvent = () => {
    setEventData({
      ...eventData,
      minute: currentMinute,
      sequence_number: events.length + 1
    });
    setEventDialogOpen(true);
  };

  const handleEventSubmit = () => {
    addEventMutation.mutate({
      ...eventData,
      sequence_number: events.length + 1
    });
  };

  const resetEventForm = () => {
    setEventData({
      event_type: 'GOAL',
      team_side: 'home',
      player_id: '',
      minute: currentMinute,
      extra_time_minute: 0,
      description: '',
      related_player_id: ''
    });
  };

  const handleEventChange = (field) => (event) => {
    setEventData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const getEventTypeLabel = (type) => {
    const labels = {
      'GOAL': '골',
      'ASSIST': '어시스트',
      'YELLOW_CARD': '옐로우카드',
      'RED_CARD': '레드카드',
      'SUBSTITUTION': '선수교체',
      'OFFSIDE': '오프사이드',
      'FOUL': '파울',
      'CORNER': '코너킥',
      'THROW_IN': '스로인',
      'FREE_KICK': '프리킥',
      'PENALTY': '페널티킥',
      'SAVE': '선방',
      'MATCH_START': '경기 시작',
      'MATCH_END': '경기 종료',
      'HALF_TIME': '하프타임'
    };
    return labels[type] || type;
  };

  if (matchLoading) {
    return (
      <Container>
        <Typography>경기 정보를 불러오는 중...</Typography>
      </Container>
    );
  }

  if (matchError || !match) {
    return (
      <Container>
        <Alert severity="error">
          경기 정보를 불러올 수 없습니다.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Match Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1">
            라이브 스코어링
          </Typography>
          <Chip
            label={getStatusLabel(match.status)}
            color={match.status === 'in_progress' ? 'success' : 'default'}
            variant="outlined"
          />
        </Box>

        {/* Score Display */}
        <Box display="flex" justifyContent="center" alignItems="center" mb={3}>
          <Box textAlign="center" sx={{ minWidth: 150 }}>
            <Typography variant="h6">{match.homeClub?.name}</Typography>
            <Typography variant="h2" color="primary" fontWeight="bold">
              {match.home_score}
            </Typography>
          </Box>

          <Box mx={4} textAlign="center">
            <Typography variant="h3" color="text.secondary">VS</Typography>
            <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
              <TimerIcon fontSize="small" />
              <Typography variant="h6" ml={1}>
                {currentMinute}'
              </Typography>
            </Box>
          </Box>

          <Box textAlign="center" sx={{ minWidth: 150 }}>
            <Typography variant="h6">{match.awayClub?.name}</Typography>
            <Typography variant="h2" color="primary" fontWeight="bold">
              {match.away_score}
            </Typography>
          </Box>
        </Box>

        {/* Match Controls */}
        <Box display="flex" justifyContent="center" gap={2}>
          {match.status === 'scheduled' && (
            <Button
              variant="contained"
              startIcon={<StartIcon />}
              onClick={handleStartMatch}
              disabled={addEventMutation.isPending}
            >
              경기 시작
            </Button>
          )}

          {match.status === 'in_progress' && (
            <>
              {isMatchRunning ? (
                <Button
                  variant="outlined"
                  startIcon={<PauseIcon />}
                  onClick={handlePauseMatch}
                >
                  일시정지
                </Button>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<StartIcon />}
                  onClick={() => setIsMatchRunning(true)}
                >
                  재개
                </Button>
              )}

              <Button
                variant="contained"
                color="error"
                startIcon={<StopIcon />}
                onClick={handleEndMatch}
                disabled={addEventMutation.isPending}
              >
                경기 종료
              </Button>
            </>
          )}
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Event Controls */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              이벤트 기록
            </Typography>

            <Stack spacing={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<GoalIcon />}
                onClick={() => {
                  setEventData({...eventData, event_type: 'GOAL'});
                  handleAddEvent();
                }}
                disabled={match.status !== 'in_progress'}
              >
                골
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<CardIcon />}
                onClick={() => {
                  setEventData({...eventData, event_type: 'YELLOW_CARD'});
                  handleAddEvent();
                }}
                disabled={match.status !== 'in_progress'}
              >
                카드
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<SubstitutionIcon />}
                onClick={() => {
                  setEventData({...eventData, event_type: 'SUBSTITUTION'});
                  handleAddEvent();
                }}
                disabled={match.status !== 'in_progress'}
              >
                선수교체
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddEvent}
                disabled={match.status !== 'in_progress'}
              >
                기타 이벤트
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Event Timeline */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              경기 타임라인
            </Typography>

            {eventsLoading ? (
              <Typography>이벤트를 불러오는 중...</Typography>
            ) : events.length === 0 ? (
              <Typography color="text.secondary">
                아직 기록된 이벤트가 없습니다.
              </Typography>
            ) : (
              <Box>
                {events
                  .sort((a, b) => b.sequence_number - a.sequence_number)
                  .map((event) => (
                    <Box
                      key={event.id}
                      display="flex"
                      alignItems="center"
                      py={1}
                      borderBottom="1px solid"
                      borderColor="divider"
                    >
                      <Box sx={{ minWidth: 60, textAlign: 'center' }}>
                        <Typography variant="body2" fontWeight="bold">
                          {event.minute}'
                          {event.extra_time_minute > 0 && `+${event.extra_time_minute}`}
                        </Typography>
                      </Box>

                      <Box sx={{ minWidth: 40, textAlign: 'center' }}>
                        <Typography variant="h6">
                          {getEventIcon(event.event_type)}
                        </Typography>
                      </Box>

                      <Box flexGrow={1}>
                        <Typography variant="body1">
                          <strong>{getEventTypeLabel(event.event_type)}</strong>
                          {event.player && ` - ${event.player.name}`}
                          {event.description && ` (${event.description})`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {event.team_side === 'home' ? match.homeClub?.name : match.awayClub?.name}
                        </Typography>
                      </Box>

                      {event.event_type === 'GOAL' && (
                        <Chip
                          label={event.team_side === 'home' ? '홈 득점' : '원정 득점'}
                          size="small"
                          color={event.team_side === 'home' ? 'primary' : 'secondary'}
                        />
                      )}
                    </Box>
                  ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Add Event Dialog */}
      <Dialog open={eventDialogOpen} onClose={() => setEventDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>이벤트 추가</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>이벤트 타입</InputLabel>
                <Select
                  value={eventData.event_type}
                  onChange={handleEventChange('event_type')}
                  label="이벤트 타입"
                >
                  <MenuItem value="GOAL">골</MenuItem>
                  <MenuItem value="YELLOW_CARD">옐로우카드</MenuItem>
                  <MenuItem value="RED_CARD">레드카드</MenuItem>
                  <MenuItem value="SUBSTITUTION">선수교체</MenuItem>
                  <MenuItem value="OFFSIDE">오프사이드</MenuItem>
                  <MenuItem value="FOUL">파울</MenuItem>
                  <MenuItem value="CORNER">코너킥</MenuItem>
                  <MenuItem value="FREE_KICK">프리킥</MenuItem>
                  <MenuItem value="PENALTY">페널티킥</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>팀</InputLabel>
                <Select
                  value={eventData.team_side}
                  onChange={handleEventChange('team_side')}
                  label="팀"
                >
                  <MenuItem value="home">{match.homeClub?.name}</MenuItem>
                  <MenuItem value="away">{match.awayClub?.name}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="분"
                value={eventData.minute}
                onChange={handleEventChange('minute')}
                inputProps={{ min: 0, max: 200 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="추가시간"
                value={eventData.extra_time_minute}
                onChange={handleEventChange('extra_time_minute')}
                inputProps={{ min: 0, max: 30 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="설명"
                value={eventData.description}
                onChange={handleEventChange('description')}
                placeholder="이벤트에 대한 추가 정보"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventDialogOpen(false)}>
            취소
          </Button>
          <Button
            variant="contained"
            onClick={handleEventSubmit}
            disabled={addEventMutation.isPending}
          >
            {addEventMutation.isPending ? '추가 중...' : '이벤트 추가'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LiveScoring;