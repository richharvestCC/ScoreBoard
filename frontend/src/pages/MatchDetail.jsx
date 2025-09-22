import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Divider,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Fab
} from '@mui/material';
import {
  SportsSoccer as SoccerIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Timer as TimerIcon,
  EmojiEvents as TrophyIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchAPI } from '../services/api';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`match-tabpanel-${index}`}
    aria-labelledby={`match-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const MatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [eventFormData, setEventFormData] = useState({
    event_type: '',
    player_name: '',
    minute: '',
    description: ''
  });

  const { data: matchData, isLoading, isError } = useQuery({
    queryKey: ['match', id],
    queryFn: () => matchAPI.getById(id),
    select: (response) => response.data.data
  });

  const { data: eventsData } = useQuery({
    queryKey: ['match-events', id],
    queryFn: () => matchAPI.getEvents(id),
    select: (response) => response.data.data,
    enabled: !!id
  });

  const updateMatchMutation = useMutation({
    mutationFn: ({ id, data }) => matchAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['match', id]);
    }
  });

  const addEventMutation = useMutation({
    mutationFn: (eventData) => matchAPI.addEvent(id, eventData),
    onSuccess: () => {
      queryClient.invalidateQueries(['match-events', id]);
      setEventDialogOpen(false);
      setEventFormData({
        event_type: '',
        player_name: '',
        minute: '',
        description: ''
      });
    }
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleStartMatch = () => {
    updateMatchMutation.mutate({
      id,
      data: { status: 'in_progress' }
    });
  };

  const handleEndMatch = () => {
    updateMatchMutation.mutate({
      id,
      data: { status: 'completed' }
    });
  };

  const handleAddEvent = () => {
    if (!eventFormData.event_type || !eventFormData.minute) return;

    addEventMutation.mutate({
      ...eventFormData,
      minute: parseInt(eventFormData.minute)
    });
  };

  const getMatchTypeLabel = (type) => {
    switch(type) {
      case 'practice': return '연습경기';
      case 'casual': return '캐주얼';
      case 'friendly': return '친선경기';
      case 'tournament': return '토너먼트';
      case 'a_friendly': return 'A매치 친선';
      case 'a_tournament': return 'A매치 토너먼트';
      default: return type;
    }
  };

  const getMatchTypeColor = (type) => {
    switch(type) {
      case 'practice': return 'default';
      case 'casual': return 'primary';
      case 'friendly': return 'success';
      case 'tournament': return 'secondary';
      case 'a_friendly': return 'warning';
      case 'a_tournament': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'scheduled': return '예정';
      case 'in_progress': return '진행중';
      case 'completed': return '완료';
      case 'cancelled': return '취소';
      case 'postponed': return '연기';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'scheduled': return 'info';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'postponed': return 'default';
      default: return 'default';
    }
  };

  const getStageLabel = (stage) => {
    switch(stage) {
      case 'group': return '조별리그';
      case 'round_of_16': return '16강';
      case 'quarter': return '8강';
      case 'semi': return '준결승';
      case 'final': return '결승';
      case 'regular_season': return '정규시즌';
      case 'playoff': return '플레이오프';
      default: return stage;
    }
  };

  const getEventTypeLabel = (type) => {
    switch(type) {
      case 'goal': return '골';
      case 'yellow_card': return '옐로우카드';
      case 'red_card': return '레드카드';
      case 'substitution': return '교체';
      case 'corner': return '코너킥';
      case 'penalty': return '페널티';
      case 'offside': return '오프사이드';
      case 'foul': return '파울';
      default: return type;
    }
  };

  const getEventIcon = (type) => {
    switch(type) {
      case 'goal': return '⚽';
      case 'yellow_card': return '🟡';
      case 'red_card': return '🔴';
      case 'substitution': return '🔄';
      case 'corner': return '📐';
      case 'penalty': return '🎯';
      case 'offside': return '🚩';
      case 'foul': return '❌';
      default: return '📝';
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !matchData) {
    return (
      <Container>
        <Typography variant="h6" color="error" align="center">
          경기 정보를 불러오는데 실패했습니다.
        </Typography>
      </Container>
    );
  }

  const match = matchData;
  const events = eventsData || [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 매치 헤더 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    mr: 2,
                    bgcolor: 'primary.main'
                  }}
                >
                  <SoccerIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="h1" gutterBottom>
                    {match.home_club?.name} vs {match.away_club?.name}
                  </Typography>
                  {match.match_number && (
                    <Typography variant="body1" color="text.secondary">
                      경기번호: {match.match_number}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                <Chip
                  label={getMatchTypeLabel(match.match_type)}
                  color={getMatchTypeColor(match.match_type)}
                />
                <Chip
                  label={getStatusLabel(match.status)}
                  color={getStatusColor(match.status)}
                  variant="outlined"
                />
                {match.stage && (
                  <Chip
                    label={getStageLabel(match.stage)}
                    variant="outlined"
                  />
                )}
              </Box>

              {match.tournament && (
                <Box display="flex" alignItems="center" mb={1}>
                  <TrophyIcon fontSize="small" color="action" />
                  <Typography variant="body1" color="text.secondary" ml={0.5}>
                    {match.tournament.name}
                  </Typography>
                </Box>
              )}

              <Grid container spacing={2} sx={{ mt: 1 }}>
                {match.match_date && (
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center">
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" ml={0.5}>
                        {new Date(match.match_date).toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {match.venue && (
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center">
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" ml={0.5}>
                        {match.venue}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {match.duration_minutes && (
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center">
                      <TimerIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" ml={0.5}>
                        {match.duration_minutes}분
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {match.referee_name && (
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center">
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" ml={0.5}>
                        심판: {match.referee_name}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Grid>

            <Grid item xs={12} md={4}>
              {/* 스코어 표시 */}
              {match.status === 'completed' || match.status === 'in_progress' ? (
                <Box textAlign="center" p={3} bgcolor="action.hover" borderRadius={2}>
                  <Typography variant="h2" fontWeight="bold">
                    {match.home_score || 0} - {match.away_score || 0}
                  </Typography>
                </Box>
              ) : (
                <Box textAlign="center" p={3}>
                  <Typography variant="h6" color="text.secondary">
                    경기 예정
                  </Typography>
                </Box>
              )}

              {/* 매치 컨트롤 버튼 */}
              <Box mt={2} display="flex" gap={1} justifyContent="center">
                {match.status === 'scheduled' && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<PlayIcon />}
                    onClick={handleStartMatch}
                    disabled={updateMatchMutation.isLoading}
                  >
                    경기 시작
                  </Button>
                )}
                {match.status === 'in_progress' && (
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<StopIcon />}
                    onClick={handleEndMatch}
                    disabled={updateMatchMutation.isLoading}
                  >
                    경기 종료
                  </Button>
                )}
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/matches/${id}/edit`)}
                >
                  수정
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 탭 네비게이션 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="경기 상세" />
          <Tab label="경기 이벤트" />
          <Tab label="통계" />
        </Tabs>
      </Box>

      {/* 경기 상세 탭 */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  경기 정보
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {match.weather && (
                  <Box mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      날씨: {match.weather}
                    </Typography>
                  </Box>
                )}

                {match.round_number && (
                  <Box mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      라운드: {match.round_number}
                    </Typography>
                  </Box>
                )}

                {match.group_name && (
                  <Box mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      조: {match.group_name}조
                    </Typography>
                  </Box>
                )}

                {match.notes && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      경기 노트
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {match.notes}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  팀 정보
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box mb={3}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    홈팀: {match.home_club?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {match.home_club?.description}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    원정팀: {match.away_club?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {match.away_club?.description}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* 경기 이벤트 탭 */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                경기 이벤트
              </Typography>
              {match.status === 'in_progress' && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setEventDialogOpen(true)}
                >
                  이벤트 추가
                </Button>
              )}
            </Box>

            {events.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                아직 이벤트가 없습니다.
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>시간</TableCell>
                      <TableCell>이벤트</TableCell>
                      <TableCell>선수</TableCell>
                      <TableCell>설명</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>{event.minute}'</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <span>{getEventIcon(event.event_type)}</span>
                            {getEventTypeLabel(event.event_type)}
                          </Box>
                        </TableCell>
                        <TableCell>{event.player_name}</TableCell>
                        <TableCell>{event.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* 통계 탭 */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              경기 통계
            </Typography>
            <Typography variant="body2" color="text.secondary">
              경기 통계 기능은 추후 구현 예정입니다.
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>

      {/* 이벤트 추가 다이얼로그 */}
      <Dialog open={eventDialogOpen} onClose={() => setEventDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>경기 이벤트 추가</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>이벤트 타입</InputLabel>
                <Select
                  value={eventFormData.event_type}
                  onChange={(e) => setEventFormData(prev => ({ ...prev, event_type: e.target.value }))}
                  label="이벤트 타입"
                >
                  <MenuItem value="goal">골</MenuItem>
                  <MenuItem value="yellow_card">옐로우카드</MenuItem>
                  <MenuItem value="red_card">레드카드</MenuItem>
                  <MenuItem value="substitution">교체</MenuItem>
                  <MenuItem value="corner">코너킥</MenuItem>
                  <MenuItem value="penalty">페널티</MenuItem>
                  <MenuItem value="offside">오프사이드</MenuItem>
                  <MenuItem value="foul">파울</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="경기 시간 (분)"
                value={eventFormData.minute}
                onChange={(e) => setEventFormData(prev => ({ ...prev, minute: e.target.value }))}
                inputProps={{ min: 0, max: 120 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="선수명"
                value={eventFormData.player_name}
                onChange={(e) => setEventFormData(prev => ({ ...prev, player_name: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="설명"
                value={eventFormData.description}
                onChange={(e) => setEventFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventDialogOpen(false)}>
            취소
          </Button>
          <Button
            onClick={handleAddEvent}
            variant="contained"
            disabled={!eventFormData.event_type || !eventFormData.minute || addEventMutation.isLoading}
          >
            추가
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MatchDetail;