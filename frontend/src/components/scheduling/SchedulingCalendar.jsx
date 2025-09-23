import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Alert,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Event as EventIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schedulingAPI } from '../../services/schedulingAPI';
import moment from 'moment';

const SchedulingCalendar = ({ competitionId, onMatchSelect }) => {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(moment().startOf('month'));
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [editData, setEditData] = useState({
    match_date: '',
    venue: '',
    estimated_duration: 90
  });

  // 월별 스케줄 조회
  const { data: scheduleData, isLoading } = useQuery({
    queryKey: ['competitionSchedule', competitionId, currentDate.format('YYYY-MM')],
    queryFn: () => schedulingAPI.getCompetitionSchedule(competitionId, {
      startDate: currentDate.clone().startOf('month').format('YYYY-MM-DD'),
      endDate: currentDate.clone().endOf('month').format('YYYY-MM-DD')
    }).then(res => res.data.data),
    enabled: !!competitionId
  });

  // 경기 수정 mutation
  const scheduleMatchMutation = useMutation({
    mutationFn: ({ matchId, scheduleData }) =>
      schedulingAPI.scheduleMatch(matchId, scheduleData),
    onSuccess: () => {
      queryClient.invalidateQueries(['competitionSchedule']);
      setEditDialog(false);
      setSelectedMatch(null);
    }
  });

  // 캘린더 그리드 생성
  const generateCalendarDays = () => {
    const startOfMonth = currentDate.clone().startOf('month');
    const endOfMonth = currentDate.clone().endOf('month');
    const startDate = startOfMonth.clone().startOf('week');
    const endDate = endOfMonth.clone().endOf('week');

    const days = [];
    let current = startDate.clone();

    while (current.isSameOrBefore(endDate)) {
      days.push(current.clone());
      current.add(1, 'day');
    }

    return days;
  };

  // 날짜별 경기 조회
  const getMatchesForDate = (date) => {
    if (!scheduleData?.matches) return [];

    return scheduleData.matches.filter(match =>
      moment(match.match_date).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
    );
  };

  // 스케줄링 상태에 따른 색상
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'conflicted': return 'error';
      case 'rescheduled': return 'info';
      default: return 'default';
    }
  };

  // 스케줄링 상태에 따른 아이콘
  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckIcon fontSize="small" />;
      case 'pending': return <ScheduleIcon fontSize="small" />;
      case 'conflicted': return <WarningIcon fontSize="small" />;
      case 'rescheduled': return <EditIcon fontSize="small" />;
      default: return <EventIcon fontSize="small" />;
    }
  };

  // 경기 편집 핸들러
  const handleEditMatch = (match) => {
    setSelectedMatch(match);
    setEditData({
      match_date: moment(match.match_date).format('YYYY-MM-DDTHH:mm'),
      venue: match.venue || '',
      estimated_duration: match.estimated_duration || 90
    });
    setEditDialog(true);
  };

  // 경기 저장 핸들러
  const handleSaveMatch = () => {
    if (!selectedMatch || !editData.match_date) return;

    scheduleMatchMutation.mutate({
      matchId: selectedMatch.id,
      scheduleData: editData
    });
  };

  const calendarDays = generateCalendarDays();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* 캘린더 헤더 */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <IconButton
          onClick={() => setCurrentDate(prev => prev.clone().subtract(1, 'month'))}
        >
          <ChevronLeft />
        </IconButton>

        <Typography variant="h5" fontWeight="bold">
          {currentDate.format('YYYY년 M월')}
        </Typography>

        <IconButton
          onClick={() => setCurrentDate(prev => prev.clone().add(1, 'month'))}
        >
          <ChevronRight />
        </IconButton>
      </Box>

      {/* 요일 헤더 */}
      <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap={1} mb={1}>
        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
          <Box key={day} textAlign="center" py={1}>
            <Typography variant="subtitle2" color="text.secondary">
              {day}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* 캘린더 그리드 */}
      <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap={1}>
        {calendarDays.map(day => {
          const dayMatches = getMatchesForDate(day);
          const isCurrentMonth = day.month() === currentDate.month();
          const isToday = day.isSame(moment(), 'day');

          return (
            <Card
              key={day.format('YYYY-MM-DD')}
              variant="outlined"
              sx={{
                minHeight: 120,
                backgroundColor: isCurrentMonth ? 'background.paper' : 'action.hover',
                border: isToday ? 2 : 1,
                borderColor: isToday ? 'primary.main' : 'divider',
                cursor: dayMatches.length > 0 ? 'pointer' : 'default'
              }}
              onClick={() => dayMatches.length > 0 && onMatchSelect?.(dayMatches)}
            >
              <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                <Typography
                  variant="caption"
                  color={isCurrentMonth ? 'text.primary' : 'text.disabled'}
                  fontWeight={isToday ? 'bold' : 'normal'}
                >
                  {day.format('D')}
                </Typography>

                {/* 경기 목록 */}
                <Box mt={0.5}>
                  {dayMatches.slice(0, 3).map(match => (
                    <Tooltip
                      key={match.id}
                      title={
                        <Box>
                          <Typography variant="body2">
                            {match.homeClub?.name} vs {match.awayClub?.name}
                          </Typography>
                          <Typography variant="caption">
                            {moment(match.match_date).format('HH:mm')}
                            {match.venue && ` • ${match.venue}`}
                          </Typography>
                          <Typography variant="caption" display="block">
                            상태: {match.scheduling_status}
                          </Typography>
                        </Box>
                      }
                    >
                      <Chip
                        size="small"
                        label={moment(match.match_date).format('HH:mm')}
                        color={getStatusColor(match.scheduling_status)}
                        icon={getStatusIcon(match.scheduling_status)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditMatch(match);
                        }}
                        sx={{
                          fontSize: '0.7rem',
                          height: 20,
                          mb: 0.5,
                          width: '100%',
                          '& .MuiChip-label': {
                            px: 0.5
                          }
                        }}
                      />
                    </Tooltip>
                  ))}

                  {dayMatches.length > 3 && (
                    <Typography variant="caption" color="text.secondary">
                      +{dayMatches.length - 3}개 더
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* 경기 편집 다이얼로그 */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>경기 스케줄 편집</DialogTitle>
        <DialogContent>
          {selectedMatch && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                {selectedMatch.homeClub?.name} vs {selectedMatch.awayClub?.name}
              </Typography>

              <TextField
                fullWidth
                label="경기 날짜 및 시간"
                type="datetime-local"
                value={editData.match_date}
                onChange={(e) => setEditData(prev => ({ ...prev, match_date: e.target.value }))}
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="경기장"
                value={editData.venue}
                onChange={(e) => setEditData(prev => ({ ...prev, venue: e.target.value }))}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="예상 경기 시간 (분)"
                type="number"
                value={editData.estimated_duration}
                onChange={(e) => setEditData(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) }))}
                inputProps={{ min: 30, max: 240 }}
              />

              {selectedMatch.conflict_reason && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  {selectedMatch.conflict_reason}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>
            취소
          </Button>
          <Button
            onClick={handleSaveMatch}
            variant="contained"
            disabled={scheduleMatchMutation.isLoading || !editData.match_date}
          >
            {scheduleMatchMutation.isLoading ? '저장 중...' : '저장'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SchedulingCalendar;