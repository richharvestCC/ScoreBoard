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
  Chip,
  Avatar
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  EmojiEvents as TrophyIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { competitionAPI } from '../services/api';
import CreateTournamentDialog from '../components/tournaments/CreateTournamentDialog';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

const CompetitionList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const {
    data: competitionsData,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['competitions', { search, page }],
    queryFn: () => competitionAPI.getAll({ search, page, limit: 12 }),
    keepPreviousData: true
  });

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleCompetitionClick = (competitionId) => {
    navigate(`/competitions/${competitionId}`);
  };

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    refetch();
  };

  const getCompetitionTypeLabel = (type) => {
    return type === 'league' ? '리그' : '대회';
  };

  const getCompetitionTypeColor = (type) => {
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LoadingSkeleton variant="page" container />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <EmptyState
          variant="error"
          title="대회 목록을 불러올 수 없습니다"
          description="네트워크 연결을 확인하고 다시 시도해주세요."
          actions={[
            {
              label: '다시 시도',
              onClick: () => window.location.reload(),
              variant: 'contained'
            }
          ]}
        />
      </Container>
    );
  }

  const competitions = competitionsData?.data?.data || [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          대회 목록
        </Typography>

        <TextField
          fullWidth
          placeholder="대회 이름, 형식으로 검색..."
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

      {competitions.length === 0 ? (
        <EmptyState
          variant={search ? 'search' : 'create'}
          title={search ? '검색 결과가 없습니다' : '등록된 대회가 없습니다'}
          description={search ?
            '다른 검색어를 사용하거나 필터를 조정해보세요.' :
            '새로운 대회를 만들어 참가자들과 함께 경기를 시작해보세요!'
          }
          actions={search ? [
            {
              label: '검색 초기화',
              onClick: () => setSearch(''),
              variant: 'outlined'
            }
          ] : [
            {
              label: '대회 만들기',
              onClick: () => setCreateDialogOpen(true),
              variant: 'contained',
              startIcon: <AddIcon />
            }
          ]}
        />
      ) : (
        <Grid container spacing={3}>
          {competitions.map((competition) => (
            <Grid item xs={12} sm={6} md={4} key={competition.id}>
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
                onClick={() => handleCompetitionClick(competition.id)}
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
                        {competition.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        by {competition.admin?.name || '관리자'}
                      </Typography>
                    </Box>
                  </Box>

                  {competition.description && (
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
                      {competition.description}
                    </Typography>
                  )}

                  <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                    <Chip
                      label={getCompetitionTypeLabel(competition.competition_type)}
                      size="small"
                      color={getCompetitionTypeColor(competition.competition_type)}
                    />
                    <Chip
                      label={getFormatLabel(competition.format)}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={getStatusLabel(competition.status)}
                      size="small"
                      color={getStatusColor(competition.status)}
                      variant="outlined"
                    />
                  </Box>

                  <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                    {competition.start_date && (
                      <Box display="flex" alignItems="center">
                        <CalendarIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary" ml={0.5}>
                          {new Date(competition.start_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Box display="flex" alignItems="center">
                    <PeopleIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary" ml={0.5}>
                      {competition.participants?.length || 0}개 팀
                    </Typography>
                    {competition.max_participants && (
                      <Typography variant="body2" color="text.secondary">
                        / {competition.max_participants}
                      </Typography>
                    )}
                  </Box>
                </CardContent>

                <CardActions>
                  <Button size="small" onClick={(e) => {
                    e.stopPropagation();
                    handleCompetitionClick(competition.id);
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
        aria-label="add competition"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Create Competition Dialog */}
      <CreateTournamentDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </Container>
  );
};

export default CompetitionList;