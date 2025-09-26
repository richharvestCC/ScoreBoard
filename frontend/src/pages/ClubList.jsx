import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
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
  Dialog,
  CircularProgress,
  Chip,
  Avatar
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { debounce } from 'lodash';
import { clubAPI } from '../services/api';
import CreateClubDialog from '../components/clubs/CreateClubDialog';
import { getClubTypeLabel, getClubTypeColor } from '../constants/clubTypes';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

const ClubList = React.memo(() => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const loadMoreRef = useRef(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch
  } = useInfiniteQuery({
    queryKey: ['clubs', { search: debouncedSearch }],
    queryFn: ({ pageParam = 1 }) => clubAPI.getAll({
      search: debouncedSearch,
      page: pageParam,
      limit: 12
    }),
    getNextPageParam: (lastPage, pages) => {
      const hasMore = lastPage?.data?.data?.length === 12;
      return hasMore ? pages.length + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (previousData) => previousData
  });

  // Debounced search handler
  const debouncedSetSearch = useCallback(
    debounce((value) => {
      setDebouncedSearch(value);
    }, 300),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleSearchChange = useCallback((event) => {
    const value = event.target.value;
    setSearch(value);
    debouncedSetSearch(value);
  }, [debouncedSetSearch]);

  const handleClubClick = useCallback((clubId) => {
    navigate(`/clubs/${clubId}`);
  }, [navigate]);

  const handleCreateSuccess = useCallback(() => {
    setCreateDialogOpen(false);
    refetch();
  }, [refetch]);

  // Flatten paginated data
  const clubs = useMemo(() => {
    return data?.pages.flatMap(page => page?.data?.data || []) || [];
  }, [data]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

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
          title="클럽 목록을 불러올 수 없습니다"
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          클럽 목록
        </Typography>

        <TextField
          fullWidth
          placeholder="클럽 이름, 위치로 검색..."
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

      {clubs.length === 0 ? (
        <EmptyState
          variant={search ? 'search' : 'create'}
          title={search ? '검색 결과가 없습니다' : '등록된 클럽이 없습니다'}
          description={search ?
            '다른 검색어를 사용하거나 필터를 조정해보세요.' :
            '새로운 클럽을 만들어 멤버들과 함께 활동을 시작해보세요!'
          }
          actions={search ? [
            {
              label: '검색 초기화',
              onClick: () => setSearch(''),
              variant: 'outlined'
            }
          ] : [
            {
              label: '클럽 만들기',
              onClick: () => setCreateDialogOpen(true),
              variant: 'contained',
              startIcon: <AddIcon />
            }
          ]}
        />
      ) : (
        <>
          <Grid container spacing={3}>
            {clubs.map((club, index) => (
              <Grid item xs={12} sm={6} md={4} key={`${club.id}-${index}`}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                  onClick={() => handleClubClick(club.id)}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar
                        src={club.logo_url}
                        sx={{ width: 48, height: 48, mr: 2 }}
                      >
                        {club.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="h2" noWrap>
                          {club.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          by {club.creator?.name}
                        </Typography>
                      </Box>
                    </Box>

                    {club.description && (
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
                        {club.description}
                      </Typography>
                    )}

                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                      {club.club_type && (
                        <Chip
                          label={getClubTypeLabel(club.club_type)}
                          size="small"
                          color={getClubTypeColor(club.club_type)}
                        />
                      )}
                      {club.location && (
                        <Chip
                          icon={<LocationIcon />}
                          label={club.location}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {club.founded_year && (
                        <Chip
                          icon={<CalendarIcon />}
                          label={club.founded_year}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    <Box display="flex" alignItems="center">
                      <PeopleIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" ml={0.5}>
                        {club.members?.length || 0}명
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions>
                    <Button size="small" onClick={(e) => {
                      e.stopPropagation();
                      handleClubClick(club.id);
                    }}>
                      자세히 보기
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Infinite scroll trigger */}
          {hasNextPage && (
            <Box
              ref={loadMoreRef}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 4,
                py: 2
              }}
            >
              {isFetchingNextPage ? (
                <LoadingSkeleton variant="card" count={3} />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  더 많은 클럽을 불러오는 중...
                </Typography>
              )}
            </Box>
          )}
        </>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add club"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Create Club Dialog */}
      <CreateClubDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </Container>
  );
});

// displayName 설정
ClubList.displayName = 'ClubList';

export default ClubList;