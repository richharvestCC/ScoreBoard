import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Paper,
  Stack,
  Avatar,
  Divider,
  LinearProgress,
  useTheme,
  alpha,
  Container,
} from '@mui/material';
import {
  Search,
  SportsSoccer,
  SportsHandball,
  LocationOn,
  CalendarToday,
  Group,
  EmojiEvents,
  TrendingUp,
  Schedule,
  Person,
  Visibility,
  MoreVert,
} from '@mui/icons-material';

// Mock data for competitions (축구/풋살 전용)
const mockCompetitions = [
  {
    id: 1,
    title: '서울 풋살 리그 2024',
    organizer: '서울FC클럽',
    image: '/api/placeholder/300/200',
    startDate: '2024-03-15',
    endDate: '2024-04-20',
    format: '토너먼트',
    category: '성인남성',
    sport: 'futsal',
    location: '강남구',
    participants: 16,
    maxParticipants: 20,
  },
  {
    id: 2,
    title: '강남 축구 대회',
    organizer: '강남클럽',
    image: '/api/placeholder/300/200',
    startDate: '2024-04-01',
    endDate: '2024-04-15',
    format: '리그전',
    category: '아마추어',
    sport: 'football',
    location: '강남구',
    participants: 12,
    maxParticipants: 16,
  },
  {
    id: 3,
    title: '부산 풋살 챔피언십',
    organizer: '부산축구협회',
    image: '/api/placeholder/300/200',
    startDate: '2024-05-01',
    endDate: '2024-05-30',
    format: '토너먼트',
    category: '대학생',
    sport: 'futsal',
    location: '부산시',
    participants: 24,
    maxParticipants: 32,
  },
  {
    id: 4,
    title: '서울 주말 축구 리그',
    organizer: '서울시축구연맹',
    image: '/api/placeholder/300/200',
    startDate: '2024-03-30',
    endDate: '2024-06-30',
    format: '리그전',
    category: '성인',
    sport: 'football',
    location: '서울시',
    participants: 20,
    maxParticipants: 24,
  },
];

const CompetitionPage = () => {
  const theme = useTheme();
  const [competitions, setCompetitions] = useState(mockCompetitions);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');

  // Dashboard statistics
  const dashboardStats = {
    totalCompetitions: competitions.length,
    activeCompetitions: competitions.filter(c => new Date(c.endDate) > new Date()).length,
    totalParticipants: competitions.reduce((sum, c) => sum + c.participants, 0),
    averageParticipation: Math.round((competitions.reduce((sum, c) => sum + (c.participants / c.maxParticipants), 0) / competitions.length) * 100),
  };

  // Filter competitions based on search and sport
  const filteredCompetitions = competitions.filter(competition => {
    const matchesSearch = competition.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         competition.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         competition.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === 'all' || competition.sport === selectedSport;
    return matchesSearch && matchesSport;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getSportIcon = (sport) => {
    return sport === 'football' ? <SportsSoccer /> : <SportsHandball />;
  };

  const getStatusColor = (competition) => {
    const now = new Date();
    const startDate = new Date(competition.startDate);
    const endDate = new Date(competition.endDate);

    if (now < startDate) return 'info';
    if (now >= startDate && now <= endDate) return 'success';
    return 'default';
  };

  const getStatusText = (competition) => {
    const now = new Date();
    const startDate = new Date(competition.startDate);
    const endDate = new Date(competition.endDate);

    if (now < startDate) return '예정';
    if (now >= startDate && now <= endDate) return '진행중';
    return '완료';
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Dashboard Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            fontWeight={600}
            sx={{ mb: 1 }}
          >
            Competition Dashboard
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            축구와 풋살 대회 현황 관리
          </Typography>
        </Box>

        {/* Dashboard Statistics Cards - Financial Dashboard Style */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
                backdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.05) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                },
                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }}
            >
              <Box sx={{ p: 3 }}>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 3 }}>
                  <Box>
                    <Typography variant="body2" sx={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      mb: 1,
                    }}>
                      전체 대회
                    </Typography>
                    <Typography variant="h3" sx={{
                      fontWeight: 800,
                      fontSize: '2.5rem',
                      color: 'rgba(255, 255, 255, 0.95)',
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                    }}>
                      {dashboardStats.totalCompetitions}
                    </Typography>
                  </Box>
                  <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <EmojiEvents sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 24 }} />
                  </Box>
                </Stack>
                <Box sx={{
                  height: 2,
                  borderRadius: 1,
                  background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%)',
                }} />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'center',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  opacity: 0.1,
                  borderRadius: 4,
                },
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.3s ease',
                },
              }}
            >
              <Box sx={{ p: 3 }}>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 3 }}>
                  <Box>
                    <Typography variant="body2" sx={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      mb: 1,
                    }}>
                      진행중 대회
                    </Typography>
                    <Typography variant="h3" sx={{
                      fontWeight: 800,
                      fontSize: '2.5rem',
                      color: 'rgba(255, 255, 255, 0.95)',
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                    }}>
                      {dashboardStats.activeCompetitions}
                    </Typography>
                  </Box>
                  <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Schedule sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 24 }} />
                  </Box>
                </Stack>
                <Box sx={{
                  height: 2,
                  borderRadius: 1,
                  background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.03) 100%)',
                }} />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'center',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  opacity: 0.1,
                  borderRadius: 4,
                },
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.3s ease',
                },
              }}
            >
              <Box sx={{ p: 3 }}>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 3 }}>
                  <Box>
                    <Typography variant="body2" sx={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      mb: 1,
                    }}>
                      총 참가팀
                    </Typography>
                    <Typography variant="h3" sx={{
                      fontWeight: 800,
                      fontSize: '2.5rem',
                      color: 'rgba(255, 255, 255, 0.95)',
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                    }}>
                      {dashboardStats.totalParticipants}
                    </Typography>
                  </Box>
                  <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Group sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 24 }} />
                  </Box>
                </Stack>
                <Box sx={{
                  height: 2,
                  borderRadius: 1,
                  background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 100%)',
                }} />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'center',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  opacity: 0.1,
                  borderRadius: 4,
                },
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.3s ease',
                },
              }}
            >
              <Box sx={{ p: 3 }}>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 3 }}>
                  <Box>
                    <Typography variant="body2" sx={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      mb: 1,
                    }}>
                      평균 참가율
                    </Typography>
                    <Typography variant="h3" sx={{
                      fontWeight: 800,
                      fontSize: '2.5rem',
                      color: 'rgba(255, 255, 255, 0.95)',
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                    }}>
                      {dashboardStats.averageParticipation}
                      <Typography component="span" sx={{
                        fontSize: '1.5rem',
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontWeight: 600,
                      }}>
                        %
                      </Typography>
                    </Typography>
                  </Box>
                  <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <TrendingUp sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 24 }} />
                  </Box>
                </Stack>
                <Box sx={{
                  height: 2,
                  borderRadius: 1,
                  background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.04) 100%)',
                }} />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Search and Filters - Financial Dashboard Style */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            mb: 4,
          }}
        >
          <Box sx={{ p: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
              <TextField
                placeholder="대회명, 주최자, 지역 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    '&:hover': {
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    },
                    '&.Mui-focused': {
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.08)',
                    },
                    '& fieldset': {
                      border: 'none',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                    '&::placeholder': {
                      color: 'rgba(255, 255, 255, 0.5)',
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Stack direction="row" spacing={1.5}>
                <Chip
                  label="전체"
                  onClick={() => setSelectedSport('all')}
                  sx={{
                    background: selectedSport === 'all'
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: selectedSport === 'all'
                      ? '1px solid rgba(255, 255, 255, 0.2)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    color: selectedSport === 'all'
                      ? 'rgba(255, 255, 255, 0.95)'
                      : 'rgba(255, 255, 255, 0.7)',
                    fontWeight: selectedSport === 'all' ? 600 : 500,
                    fontSize: '0.8rem',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    },
                  }}
                />
                <Chip
                  label="축구"
                  onClick={() => setSelectedSport('football')}
                  sx={{
                    background: selectedSport === 'football'
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: selectedSport === 'football'
                      ? '1px solid rgba(255, 255, 255, 0.2)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    color: selectedSport === 'football'
                      ? 'rgba(255, 255, 255, 0.95)'
                      : 'rgba(255, 255, 255, 0.7)',
                    fontWeight: selectedSport === 'football' ? 600 : 500,
                    fontSize: '0.8rem',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    },
                  }}
                />
                <Chip
                  label="풋살"
                  onClick={() => setSelectedSport('futsal')}
                  sx={{
                    background: selectedSport === 'futsal'
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: selectedSport === 'futsal'
                      ? '1px solid rgba(255, 255, 255, 0.2)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    color: selectedSport === 'futsal'
                      ? 'rgba(255, 255, 255, 0.95)'
                      : 'rgba(255, 255, 255, 0.7)',
                    fontWeight: selectedSport === 'futsal' ? 600 : 500,
                    fontSize: '0.8rem',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    },
                  }}
                />
              </Stack>
            </Stack>
          </Box>
        </Paper>

        {/* Competition Cards - Glassmorphism Style */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
            대회 목록 ({filteredCompetitions.length})
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {filteredCompetitions.map((competition) => (
            <Grid item xs={12} sm={6} lg={4} key={competition.id}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.04) 100%)',
                  backdropFilter: 'blur(25px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: competition.sport === 'football'
                      ? 'linear-gradient(90deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)'
                      : 'linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%)',
                    borderRadius: '3px 3px 0 0',
                  },
                  transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                }}
              >
                <CardContent sx={{ p: 0, position: 'relative', zIndex: 1 }}>
                  {/* Card Header */}
                  <Box sx={{
                    p: 3,
                    pb: 2,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%)',
                  }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 2.5,
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
                        border: '2px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(15px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          inset: -1,
                          borderRadius: 2.5,
                          background: competition.sport === 'football'
                            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%)'
                            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.03) 100%)',
                          zIndex: -1,
                        },
                      }}
                    >
                      {getSportIcon(competition.sport)}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          mb: 0.5,
                          fontSize: '1.1rem',
                          letterSpacing: '-0.025em',
                        }}
                      >
                        {competition.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                        }}
                      >
                        {competition.organizer}
                      </Typography>
                    </Box>
                    <Stack spacing={1} alignItems="flex-end">
                      <Chip
                        label={getStatusText(competition)}
                        size="small"
                        sx={{
                          background: getStatusColor(competition) === 'success'
                            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)'
                            : getStatusColor(competition) === 'info'
                            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)'
                            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                          backdropFilter: 'blur(15px)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />
                      <Chip
                        label={competition.sport === 'football' ? '축구' : '풋살'}
                        size="small"
                        variant="outlined"
                        sx={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.7rem',
                          fontWeight: 500,
                        }}
                      />
                    </Stack>
                  </Stack>
                  </Box>

                  {/* Card Content */}
                  <Box sx={{ p: 3, pt: 2 }}>
                    <Stack spacing={2.5} sx={{ mb: 3 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{
                          width: 20,
                          height: 20,
                          borderRadius: 1,
                          background: 'rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <CalendarToday sx={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }} />
                        </Box>
                        <Typography variant="body2" sx={{
                          color: 'rgba(255, 255, 255, 0.85)',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                        }}>
                          {formatDate(competition.startDate)} - {formatDate(competition.endDate)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{
                          width: 20,
                          height: 20,
                          borderRadius: 1,
                          background: 'rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <LocationOn sx={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }} />
                        </Box>
                        <Typography variant="body2" sx={{
                          color: 'rgba(255, 255, 255, 0.65)',
                          fontSize: '0.85rem',
                        }}>
                          {competition.location}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{
                          width: 20,
                          height: 20,
                          borderRadius: 1,
                          background: 'rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <EmojiEvents sx={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }} />
                        </Box>
                        <Typography variant="body2" sx={{
                          color: 'rgba(255, 255, 255, 0.65)',
                          fontSize: '0.85rem',
                        }}>
                          {competition.format} · {competition.category}
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* Participation Progress */}
                    <Box sx={{
                      p: 2.5,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      mb: 3,
                    }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}>
                          참가팀
                        </Typography>
                        <Typography variant="h6" sx={{
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          color: 'rgba(255, 255, 255, 0.9)',
                        }}>
                          {competition.participants}
                          <Typography component="span" sx={{
                            color: 'rgba(255, 255, 255, 0.5)',
                            fontWeight: 400,
                            fontSize: '0.9rem',
                          }}>
                            /{competition.maxParticipants}
                          </Typography>
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={(competition.participants / competition.maxParticipants) * 100}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)',
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>

                    {/* Card Actions */}
                    <Button
                      variant="outlined"
                      fullWidth
                      endIcon={<Visibility fontSize="small" />}
                      sx={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)',
                        backdropFilter: 'blur(15px)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: 2.5,
                        py: 1.5,
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        color: 'rgba(255, 255, 255, 0.9)',
                        textTransform: 'none',
                        letterSpacing: '0.25px',
                        '&:hover': {
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      }}
                    >
                      대회 보기
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredCompetitions.length === 0 && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              검색 결과가 없습니다
            </Typography>
            <Typography variant="body2" color="text.secondary">
              다른 검색어를 시도해보세요
            </Typography>
          </Box>
        )}

      </Container>
    </Box>
  );
};

export default CompetitionPage;