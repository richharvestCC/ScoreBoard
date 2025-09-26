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
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  People as PeopleIcon,
  Add as AddIcon,
  Edit as EditIcon,
  ExitToApp as ExitIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageContainer from '../components/layout/PageContainer';
import { clubAPI } from '../services/api';
import { getClubTypeLabel } from '../constants/clubTypes';

const ClubDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [joinData, setJoinData] = useState({
    role: 'player',
    jersey_number: '',
    position: ''
  });

  const {
    data: club,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['club', id],
    queryFn: () => clubAPI.getById(id),
    select: (response) => response.data.data
  });

  const {
    data: membersData,
    isLoading: membersLoading
  } = useQuery({
    queryKey: ['club-members', id],
    queryFn: () => clubAPI.getMembers(id),
    select: (response) => response.data.data,
    enabled: !!id
  });

  const joinMutation = useMutation({
    mutationFn: (data) => clubAPI.join(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['club', id] });
      queryClient.invalidateQueries({ queryKey: ['club-members', id] });
      setJoinDialogOpen(false);
      setJoinData({ role: 'player', jersey_number: '', position: '' });
    }
  });

  const leaveMutation = useMutation({
    mutationFn: () => clubAPI.leave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['club', id] });
      queryClient.invalidateQueries({ queryKey: ['club-members', id] });
    }
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleJoinSubmit = () => {
    const submitData = { ...joinData };
    if (submitData.jersey_number === '') {
      delete submitData.jersey_number;
    }
    if (submitData.position === '') {
      delete submitData.position;
    }
    joinMutation.mutate(submitData);
  };

  const handleJoinChange = (field) => (event) => {
    setJoinData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
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
          {error?.response?.data?.message || '클럽 정보를 불러오는데 실패했습니다.'}
        </Alert>
      </PageContainer>
    );
  }

  const members = membersData || [];
  const userMembership = members.find(member => member.user_id === club?.current_user_id);
  const isClubMember = !!userMembership;
  const isClubAdmin = userMembership?.role === 'admin';

  const positionLabels = {
    goalkeeper: '골키퍼',
    defender: '수비수',
    midfielder: '미드필더',
    forward: '공격수',
    center_back: '센터백',
    left_back: '레프트백',
    right_back: '라이트백',
    defensive_midfielder: '수비형 미드필더',
    central_midfielder: '중앙 미드필더',
    attacking_midfielder: '공격형 미드필더',
    left_winger: '레프트윙',
    right_winger: '라이트윙',
    striker: '스트라이커',
    center_forward: '센터 포워드'
  };

  const roleLabels = {
    admin: '관리자',
    player: '선수',
    coach: '코치',
    staff: '스태프'
  };


  return (
    <PageContainer sx={{ maxWidth: '1200px' }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <Avatar
              src={club.logo_url}
              sx={{ width: 80, height: 80, mr: 3 }}
            >
              {club.name.charAt(0)}
            </Avatar>
            <Box flexGrow={1}>
              <Typography variant="h4" component="h1" gutterBottom>
                {club.name}
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                <Chip
                  label={getClubTypeLabel(club.club_type)}
                  color="primary"
                  variant="outlined"
                />
                {club.location && (
                  <Chip
                    icon={<LocationIcon />}
                    label={club.location}
                    variant="outlined"
                  />
                )}
                {club.founded_year && (
                  <Chip
                    icon={<CalendarIcon />}
                    label={club.founded_year}
                    variant="outlined"
                  />
                )}
              </Box>
              <Box display="flex" alignItems="center">
                <PeopleIcon fontSize="small" color="action" />
                <Typography variant="body1" color="text.secondary" ml={0.5}>
                  {members.length}명
                </Typography>
              </Box>
            </Box>
          </Box>

          {club.description && (
            <Typography variant="body1" paragraph>
              {club.description}
            </Typography>
          )}

          <Box display="flex" flexWrap="wrap" gap={2}>
            {club.contact_email && (
              <Box display="flex" alignItems="center">
                <EmailIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary" ml={0.5}>
                  {club.contact_email}
                </Typography>
              </Box>
            )}
            {club.contact_phone && (
              <Box display="flex" alignItems="center">
                <PhoneIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary" ml={0.5}>
                  {club.contact_phone}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>

        <CardActions>
          {!isClubMember ? (
            <Button
              variant="contained"
              startIcon={joinMutation.isPending ? <CircularProgress size={16} /> : <AddIcon />}
              onClick={() => setJoinDialogOpen(true)}
              disabled={joinMutation.isPending}
            >
              {joinMutation.isPending ? '가입 중...' : '클럽 가입'}
            </Button>
          ) : (
            <Box display="flex" gap={1}>
              {isClubAdmin && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/clubs/${id}/edit`)}
                >
                  클럽 관리
                </Button>
              )}
              <Button
                variant="outlined"
                color="error"
                startIcon={leaveMutation.isPending ? <CircularProgress size={16} /> : <ExitIcon />}
                onClick={() => leaveMutation.mutate()}
                disabled={leaveMutation.isPending}
              >
                {leaveMutation.isPending ? '탈퇴 중...' : '클럽 탈퇴'}
              </Button>
            </Box>
          )}
        </CardActions>
      </Card>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="멤버" />
          <Tab label="경기" />
          <Tab label="통계" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>이름</TableCell>
                    <TableCell>역할</TableCell>
                    <TableCell>등번호</TableCell>
                    <TableCell>포지션</TableCell>
                    <TableCell>상태</TableCell>
                    <TableCell>가입일</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {membersLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary">
                          등록된 멤버가 없습니다.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                              {member.user?.name?.charAt(0)}
                            </Avatar>
                            {member.user?.name}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={roleLabels[member.role]}
                            size="small"
                            color={member.role === 'admin' ? 'primary' : 'default'}
                          />
                        </TableCell>
                        <TableCell>{member.jersey_number || '-'}</TableCell>
                        <TableCell>{member.position ? positionLabels[member.position] : '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={member.status === 'active' ? '활성' : '비활성'}
                            size="small"
                            color={member.status === 'active' ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(member.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {activeTab === 1 && (
            <Typography color="text.secondary" align="center">
              경기 기능은 곧 구현될 예정입니다.
            </Typography>
          )}

          {activeTab === 2 && (
            <Typography color="text.secondary" align="center">
              통계 기능은 곧 구현될 예정입니다.
            </Typography>
          )}
        </Box>
      </Paper>

      <Dialog open={joinDialogOpen} onClose={() => setJoinDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>클럽 가입</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>역할</InputLabel>
                <Select
                  value={joinData.role}
                  onChange={handleJoinChange('role')}
                  label="역할"
                >
                  <MenuItem value="player">선수</MenuItem>
                  <MenuItem value="coach">코치</MenuItem>
                  <MenuItem value="staff">스태프</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {joinData.role === 'player' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="등번호"
                    value={joinData.jersey_number}
                    onChange={handleJoinChange('jersey_number')}
                    inputProps={{ min: 1, max: 99 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>포지션</InputLabel>
                    <Select
                      value={joinData.position}
                      onChange={handleJoinChange('position')}
                      label="포지션"
                    >
                      <MenuItem value="">선택 안함</MenuItem>
                      <MenuItem value="goalkeeper">골키퍼</MenuItem>
                      <MenuItem value="defender">수비수</MenuItem>
                      <MenuItem value="midfielder">미드필더</MenuItem>
                      <MenuItem value="forward">공격수</MenuItem>
                      <MenuItem value="center_back">센터백</MenuItem>
                      <MenuItem value="left_back">레프트백</MenuItem>
                      <MenuItem value="right_back">라이트백</MenuItem>
                      <MenuItem value="defensive_midfielder">수비형 미드필더</MenuItem>
                      <MenuItem value="central_midfielder">중앙 미드필더</MenuItem>
                      <MenuItem value="attacking_midfielder">공격형 미드필더</MenuItem>
                      <MenuItem value="left_winger">레프트윙</MenuItem>
                      <MenuItem value="right_winger">라이트윙</MenuItem>
                      <MenuItem value="striker">스트라이커</MenuItem>
                      <MenuItem value="center_forward">센터 포워드</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinDialogOpen(false)}>
            취소
          </Button>
          <Button
            variant="contained"
            onClick={handleJoinSubmit}
            disabled={joinMutation.isPending}
          >
            가입하기
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default ClubDetail;
