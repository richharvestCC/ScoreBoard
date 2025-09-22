import React, { useState, useEffect } from 'react';
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
import { useQuery } from '@tanstack/react-query';
import { clubAPI } from '../services/api';
import CreateClubDialog from '../components/clubs/CreateClubDialog';

const ClubList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const {
    data: clubsData,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['clubs', { search, page }],
    queryFn: () => clubAPI.getAll({ search, page, limit: 12 }),
    keepPreviousData: true
  });

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleClubClick = (clubId) => {
    navigate(`/clubs/${clubId}`);
  };

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    refetch();
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
          클럽 목록을 불러오는데 실패했습니다.
        </Typography>
      </Container>
    );
  }

  const clubs = clubsData?.data?.data || [];

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
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {search ? '검색 결과가 없습니다.' : '등록된 클럽이 없습니다.'}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            새로운 클럽을 만들어보세요!
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            클럽 만들기
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {clubs.map((club) => (
            <Grid item xs={12} sm={6} md={4} key={club.id}>
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
                        label={
                          club.club_type === 'general' ? '일반' :
                          club.club_type === 'pro' ? '프로' :
                          club.club_type === 'youth' ? '유스' :
                          club.club_type === 'national' ? '국가대표' : club.club_type
                        }
                        size="small"
                        color={
                          club.club_type === 'pro' ? 'primary' :
                          club.club_type === 'national' ? 'secondary' :
                          club.club_type === 'youth' ? 'success' : 'default'
                        }
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
};

export default ClubList;