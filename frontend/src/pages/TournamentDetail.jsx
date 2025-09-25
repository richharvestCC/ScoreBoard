import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Avatar,
  Chip,
  Tab,
  Tabs,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Edit as EditIcon,
  GroupAdd as JoinIcon,
  ExitToApp as LeaveIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { competitionAPI } from '../services/api';
import { getClubTypeLabel } from '../constants/clubTypes';
import ParticipantList from '../components/tournament/ParticipantList';
import TournamentBracket from '../components/tournament/TournamentBracket';
import PageContainer from '../components/layout/PageContainer';
import { designTokens } from '../theme/designTokens';

// Legacy support - TODO: Remove when backend tournament API is fully deprecated
const tournamentAPI = competitionAPI;

const TournamentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);

  const {
    data: tournament,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['tournament', id],
    queryFn: () => tournamentAPI.getById(id),
    select: (response) => response.data.data
  });

  const {
    data: participantsData,
    isLoading: participantsLoading
  } = useQuery({
    queryKey: ['tournament-participants', id],
    queryFn: () => tournamentAPI.getParticipants(id),
    select: (response) => response.data.data,
    enabled: !!id
  });

  const {
    data: matchesData,
    isLoading: matchesLoading
  } = useQuery({
    queryKey: ['tournament-matches', id],
    queryFn: () => tournamentAPI.getMatches(id),
    select: (response) => response.data.data,
    enabled: !!id
  });

  const joinMutation = useMutation({
    mutationFn: (clubId) => tournamentAPI.join(id, { club_id: clubId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournament', id] });
      queryClient.invalidateQueries({ queryKey: ['tournament-participants', id] });
      setJoinDialogOpen(false);
    }
  });

  const leaveMutation = useMutation({
    mutationFn: () => tournamentAPI.leave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournament', id] });
      queryClient.invalidateQueries({ queryKey: ['tournament-participants', id] });
    }
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getTournamentTypeLabel = (type) => {
    return type === 'league' ? '리그' : '토너먼트';
  };

  const handleLeave = () => {
    leaveMutation.mutate();
  };

  const navigateToLeagueDashboard = () => {
    navigate(`/leagues/${id}/dashboard`);
  };

  const getFormatLabel = (format) => {
    switch(format) {
      case 'round_robin': return '리그전';
      case 'knockout': return '토너먼트';
      case 'mixed': return '혼합';
      default: return format;
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'draft': return '준비중';
      case 'open': return '참가모집';
      case 'closed': return '모집마감';
      case 'in_progress': return '진행중';
      case 'completed': return '완료';
      case 'cancelled': return '취소';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'draft': return 'default';
      case 'open': return 'success';
      case 'closed': return 'warning';
      case 'in_progress': return 'info';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getLevelLabel = (level) => {
    switch(level) {
      case 'local': return '지역';
      case 'national': return '전국';
      case 'international': return '국제';
      default: return level;
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <PageContainer>
        <Alert severity="error">
          {error?.response?.data?.message || '토너먼트 정보를 불러오는데 실패했습니다.'}
        </Alert>
      </PageContainer>
    );
  }

  const participants = participantsData || [];
  const matches = matchesData || [];
  const isParticipating = participants.some(p => p.user_id === tournament?.current_user_id);
  const isAdmin = tournament?.admin_user_id === tournament?.current_user_id;

  return (
    <PageContainer sx={{ color: designTokens.colors.text.light.primary }}>
      <Card sx={{
        mb: 3,
        backgroundColor: designTokens.colors.background.light.surface,
        boxShadow: designTokens.shadows.md
      }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mr: 3,
                bgcolor: 'primary.main'
              }}
            >
              <TrophyIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Box flexGrow={1}>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  ...designTokens.typography.headings.h4,
                  color: designTokens.colors.text.light.primary
                }}
              >
                {tournament.name}
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                <Chip
                  label={getTournamentTypeLabel(tournament.tournament_type)}
                  color="primary"
                />
                <Chip
                  label={getFormatLabel(tournament.format)}
                  variant="outlined"
                />
                <Chip
                  label={getStatusLabel(tournament.status)}
                  color={getStatusColor(tournament.status)}
                  variant="outlined"
                />
                <Chip
                  label={getLevelLabel(tournament.level)}
                  variant="outlined"
                />
                {tournament.has_group_stage && (
                  <Chip label="조별 예선" size="small" variant="outlined" />
                )}
              </Box>
              <Box display="flex" alignItems="center">
                <PeopleIcon fontSize="small" color="action" />
                <Typography
                  variant="body1"
                  color="text.secondary"
                  ml={0.5}
                  sx={{ color: designTokens.colors.text.light.secondary }}
                >
                  {participants.length}개 팀
                  {tournament.max_participants && ` / ${tournament.max_participants}`}
                </Typography>
              </Box>
            </Box>
          </Box>

          {tournament.description && (
            <Typography
              variant="body1"
              paragraph
              sx={{
                color: designTokens.colors.text.light.primary,
                ...designTokens.typography.body.body1
              }}
            >
              {tournament.description}
            </Typography>
          )}

          <Grid container spacing={2}>
            {tournament.start_date && (
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center">
                  <CalendarIcon fontSize="small" color="action" />
                  <Box ml={1}>
                    <Typography
                      variant="body2"
                      sx={{ color: designTokens.colors.text.light.secondary }}
                    >
                      시작일
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: designTokens.colors.text.light.primary }}
                    >
                      {new Date(tournament.start_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
            {tournament.end_date && (
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center">
                  <CalendarIcon fontSize="small" color="action" />
                  <Box ml={1}>
                    <Typography
                      variant="body2"
                      sx={{ color: designTokens.colors.text.light.secondary }}
                    >
                      종료일
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: designTokens.colors.text.light.primary }}
                    >
                      {new Date(tournament.end_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
            {tournament.entry_fee && (
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center">
                  <MoneyIcon fontSize="small" color="action" />
                  <Box ml={1}>
                    <Typography
                      variant="body2"
                      sx={{ color: designTokens.colors.text.light.secondary }}
                    >
                      참가비
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: designTokens.colors.text.light.primary }}
                    >
                      {tournament.entry_fee.toLocaleString()}원
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>

          {tournament.prize_description && (
            <Box mt={2}>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{
                  color: designTokens.colors.text.light.primary,
                  ...designTokens.typography.headings.h6
                }}
              >
                상금/상품
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: designTokens.colors.text.light.secondary }}
              >
                {tournament.prize_description}
              </Typography>
            </Box>
          )}

          {tournament.rules && (
            <Box mt={2}>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{
                  color: designTokens.colors.text.light.primary,
                  ...designTokens.typography.headings.h6
                }}
              >
                대회 규정
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: designTokens.colors.text.light.secondary,
                  whiteSpace: 'pre-line'
                }}
              >
                {tournament.rules}
              </Typography>
            </Box>
          )}
        </CardContent>

        <CardActions>
          <Box display="flex" gap={1} flexWrap="wrap">
            {tournament.competition_type === 'league' && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<TrendingUpIcon />}
                onClick={navigateToLeagueDashboard}
              >
                리그 대시보드
              </Button>
            )}
            {!isParticipating && tournament.status === 'open' ? (
              <Button
                variant="contained"
                startIcon={<JoinIcon />}
                onClick={() => setJoinDialogOpen(true)}
                disabled={joinMutation.isPending}
              >
                참가 신청
              </Button>
            ) : isParticipating ? (
              <Box display="flex" gap={1}>
                {isAdmin && (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/tournaments/${id}/manage`)}
                  >
                    토너먼트 관리
                  </Button>
                )}
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<LeaveIcon />}
                  onClick={() => leaveMutation.mutate()}
                  disabled={leaveMutation.isPending}
                >
                  참가 취소
                </Button>
              </Box>
            ) : null}
          </Box>
        </CardActions>
      </Card>

      <Paper sx={{
        mb: 3,
        backgroundColor: designTokens.colors.background.light.surface,
        boxShadow: designTokens.shadows.sm
      }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="참가팀" />
          <Tab label="대진표" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <ParticipantList
              participants={participants}
              loading={participantsLoading}
              canManage={isAdmin}
              canJoin={!isParticipating && tournament.status === 'open'}
              onJoin={() => setJoinDialogOpen(true)}
              onLeave={handleLeave}
              // onUpdateStatus={handleUpdateParticipantStatus}
            />
          )}
          {activeTab === 1 && (
            <TournamentBracket
              bracket={null} // 추후 bracket 데이터 연결
              loading={false}
            />
          )}
        </Box>
      </Paper>

      <Dialog open={joinDialogOpen} onClose={() => setJoinDialogOpen(false)}>
        <DialogTitle sx={{ color: designTokens.colors.text.light.primary }}>
          토너먼트 참가 신청
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: designTokens.colors.text.light.primary }}>
            이 토너먼트에 참가하시겠습니까?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinDialogOpen(false)}>
            취소
          </Button>
          <Button
            variant="contained"
            onClick={() => joinMutation.mutate()}
            disabled={joinMutation.isPending}
          >
            참가 신청
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default TournamentDetail;
