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
import { Pagination } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { matchAPI } from '../services/api';
import CreateMatchDialog from '../components/matches/CreateMatchDialog';
import {
  getMatchTypeLabel,
  getMatchTypeColor,
  getStatusLabel,
  getStatusColor,
  getStageLabel
} from '../utils/matchUtils';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

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
    placeholderData: (previousData) => previousData
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

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
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
          title="경기 목록을 불러올 수 없습니다"
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

  const matches = matchesData?.data?.data || [];
  const pagination = matchesData?.data?.pagination || { page: 1, totalPages: 1 };

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
        <EmptyState
          variant={search || statusFilter || typeFilter ? 'search' : 'create'}
          title={search || statusFilter || typeFilter ? '검색 결과가 없습니다' : '등록된 경기가 없습니다'}
          description={search || statusFilter || typeFilter ?
            '다른 검색어를 사용하거나 필터를 조정해보세요.' :
            '새로운 경기를 만들어 팀들과 함께 스포츠를 즐겨보세요!'
          }
          actions={search || statusFilter || typeFilter ? [
            {
              label: '필터 초기화',
              onClick: () => {
                setSearch('');
                setStatusFilter('');
                setTypeFilter('');
              },
              variant: 'outlined'
            }
          ] : [
            {
              label: '경기 만들기',
              onClick: () => setCreateDialogOpen(true),
              variant: 'contained',
              startIcon: <AddIcon />
            }
          ]}
        />
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

      {/* Pagination */}
      {matches.length > 0 && pagination.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
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