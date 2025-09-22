import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  Fab,
  CircularProgress,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  SportsSoccer as SoccerIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Timer as TimerIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { matchAPI } from '../services/api';
import CreateMatchDialog from '../components/matches/CreateMatchDialog';

const MatchList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const {
    data: matchesData,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['matches', { search, statusFilter, typeFilter, page }],
    queryFn: () => matchAPI.getAll({
      search,
      status: statusFilter,
      match_type: typeFilter,
      page,
      limit: 12
    }),
    keepPreviousData: true
  });

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  const handleTypeFilterChange = (event) => {
    setTypeFilter(event.target.value);
    setPage(1);
  };

  const handleMatchClick = (matchId) => {
    navigate(`/matches/${matchId}`);
  };

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    refetch();
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

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Container>
        <Typography variant="h6" color="error" align="center">
          경기 목록을 불러오는데 실패했습니다.
        </Typography>
      </Container>
    );
  }

  const matches = matchesData?.data?.data || [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          경기 목록
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="팀명, 장소로 검색..."
              value={search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>상태</InputLabel>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="상태"
              >
                <MenuItem value="">전체</MenuItem>
                <MenuItem value="scheduled">예정</MenuItem>
                <MenuItem value="in_progress">진행중</MenuItem>
                <MenuItem value="completed">완료</MenuItem>
                <MenuItem value="cancelled">취소</MenuItem>
                <MenuItem value="postponed">연기</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>경기 유형</InputLabel>
              <Select
                value={typeFilter}
                onChange={handleTypeFilterChange}
                label="경기 유형"
              >
                <MenuItem value="">전체</MenuItem>
                <MenuItem value="practice">연습경기</MenuItem>
                <MenuItem value="casual">캐주얼</MenuItem>
                <MenuItem value="friendly">친선경기</MenuItem>
                <MenuItem value="tournament">토너먼트</MenuItem>
                <MenuItem value="a_friendly">A매치 친선</MenuItem>
                <MenuItem value="a_tournament">A매치 토너먼트</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {matches.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {search || statusFilter || typeFilter ? '검색 결과가 없습니다.' : '등록된 경기가 없습니다.'}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            새로운 경기를 만들어보세요!
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            경기 만들기
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {matches.map((match) => (
            <Grid item xs={12} sm={6} md={4} key={match.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => handleMatchClick(match.id)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        mr: 2,
                        bgcolor: 'primary.main'
                      }}
                    >
                      <SoccerIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="h2" noWrap>
                        {match.home_club?.name} vs {match.away_club?.name}
                      </Typography>
                      {match.match_number && (
                        <Typography variant="body2" color="text.secondary">
                          경기번호: {match.match_number}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                    <Chip
                      label={getMatchTypeLabel(match.match_type)}
                      size="small"
                      color={getMatchTypeColor(match.match_type)}
                    />
                    <Chip
                      label={getStatusLabel(match.status)}
                      size="small"
                      color={getStatusColor(match.status)}
                      variant="outlined"
                    />
                    {match.stage && (
                      <Chip
                        label={getStageLabel(match.stage)}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {match.tournament && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <TrophyIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" ml={0.5}>
                        {match.tournament.name}
                      </Typography>
                    </Box>
                  )}

                  {match.match_date && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" ml={0.5}>
                        {new Date(match.match_date).toLocaleString()}
                      </Typography>
                    </Box>
                  )}

                  {match.venue && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" ml={0.5}>
                        {match.venue}
                      </Typography>
                    </Box>
                  )}

                  {match.duration_minutes && (
                    <Box display="flex" alignItems="center">
                      <TimerIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" ml={0.5}>
                        {match.duration_minutes}분
                      </Typography>
                    </Box>
                  )}

                  {match.status === 'completed' && (match.home_score !== null || match.away_score !== null) && (
                    <Box mt={2} p={1} bgcolor="action.hover" borderRadius={1}>
                      <Typography variant="h6" align="center">
                        {match.home_score || 0} - {match.away_score || 0}
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <CardActions>
                  <Button size="small" onClick={(e) => {
                    e.stopPropagation();
                    handleMatchClick(match.id);
                  }}>
                    자세히 보기
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add match"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Create Match Dialog */}
      <CreateMatchDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </Container>
  );
};

export default MatchList;