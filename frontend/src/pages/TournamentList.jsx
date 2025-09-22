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
  Avatar
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  EmojiEvents as TrophyIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tournamentAPI } from '../services/api';
import CreateTournamentDialog from '../components/tournaments/CreateTournamentDialog';

const TournamentList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const {
    data: tournamentsData,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['tournaments', { search, page }],
    queryFn: () => tournamentAPI.getAll({ search, page, limit: 12 }),
    keepPreviousData: true
  });

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleTournamentClick = (tournamentId) => {
    navigate(`/tournaments/${tournamentId}`);
  };

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    refetch();
  };

  const getTournamentTypeLabel = (type) => {
    return type === 'league' ? '리그' : '토너먼트';
  };

  const getTournamentTypeColor = (type) => {
    return type === 'league' ? 'primary' : 'secondary';
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
          토너먼트 목록을 불러오는데 실패했습니다.
        </Typography>
      </Container>
    );
  }

  const tournaments = tournamentsData?.data?.data || [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          토너먼트 목록
        </Typography>

        <TextField
          fullWidth
          placeholder="토너먼트 이름, 형식으로 검색..."
          value={search}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />
      </Box>

      {tournaments.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {search ? '검색 결과가 없습니다.' : '등록된 토너먼트가 없습니다.'}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            새로운 토너먼트를 만들어보세요!
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            토너먼트 만들기
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {tournaments.map((tournament) => (
            <Grid item xs={12} sm={6} md={4} key={tournament.id}>
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
                onClick={() => handleTournamentClick(tournament.id)}
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
                      <TrophyIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="h2" noWrap>
                        {tournament.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        by {tournament.admin?.name || '관리자'}
                      </Typography>
                    </Box>
                  </Box>

                  {tournament.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {tournament.description}
                    </Typography>
                  )}

                  <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                    <Chip
                      label={getTournamentTypeLabel(tournament.tournament_type)}
                      size="small"
                      color={getTournamentTypeColor(tournament.tournament_type)}
                    />
                    <Chip
                      label={getFormatLabel(tournament.format)}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={getStatusLabel(tournament.status)}
                      size="small"
                      color={getStatusColor(tournament.status)}
                      variant="outlined"
                    />
                  </Box>

                  <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                    {tournament.start_date && (
                      <Box display="flex" alignItems="center">
                        <CalendarIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary" ml={0.5}>
                          {new Date(tournament.start_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Box display="flex" alignItems="center">
                    <PeopleIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary" ml={0.5}>
                      {tournament.participants?.length || 0}개 팀
                    </Typography>
                    {tournament.max_participants && (
                      <Typography variant="body2" color="text.secondary">
                        / {tournament.max_participants}
                      </Typography>
                    )}
                  </Box>
                </CardContent>

                <CardActions>
                  <Button size="small" onClick={(e) => {
                    e.stopPropagation();
                    handleTournamentClick(tournament.id);
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
        aria-label="add tournament"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Create Tournament Dialog */}
      <CreateTournamentDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </Container>
  );
};

export default TournamentList;