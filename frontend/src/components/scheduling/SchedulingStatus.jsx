import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Edit as EditIcon,
  Event as EventIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schedulingAPI } from '../../services/schedulingAPI';
import moment from 'moment';

const SchedulingStatus = ({ competitionId }) => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [rescheduleDialog, setRescheduleDialog] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    match_date: '',
    venue: '',
    estimated_duration: 90,
    reason: ''
  });

  // 스케줄링 통계 조회
  const { data: stats } = useQuery({
    queryKey: ['schedulingStats', competitionId],
    queryFn: () => schedulingAPI.getSchedulingStats(competitionId).then(res => res.data.data),
    enabled: !!competitionId
  });

  // 상태별 경기 조회
  const { data: matchesData, isLoading } = useQuery({
    queryKey: ['matchesByStatus', competitionId, selectedStatus, page, rowsPerPage],
    queryFn: () => {
      if (selectedStatus === 'all') {
        return schedulingAPI.getCompetitionSchedule(competitionId, {
          page: page + 1,
          limit: rowsPerPage
        }).then(res => res.data.data);
      }
      return schedulingAPI.getMatchesByStatus(competitionId, selectedStatus, {
        page: page + 1,
        limit: rowsPerPage
      }).then(res => res.data.data);
    },
    enabled: !!competitionId
  });

  // 재스케줄링 mutation
  const rescheduleMutation = useMutation({
    mutationFn: ({ matchId, scheduleData }) =>
      schedulingAPI.rescheduleMatch(matchId, scheduleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matchesByStatus'] });
      queryClient.invalidateQueries({ queryKey: ['schedulingStats'] });
      setRescheduleDialog(false);
      setSelectedMatch(null);
    }
  });

  // 상태별 색상 및 라벨
  const statusConfig = {
    pending: { color: 'warning', label: '대기중', icon: <ScheduleIcon /> },
    confirmed: { color: 'success', label: '확정', icon: <CheckIcon /> },
    conflicted: { color: 'error', label: '충돌', icon: <WarningIcon /> },
    rescheduled: { color: 'info', label: '재조정', icon: <EditIcon /> }
  };

  // 메뉴 핸들러
  const handleMenuOpen = (event, match) => {
    setAnchorEl(event.currentTarget);
    setSelectedMatch(match);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMatch(null);
  };

  // 재스케줄링 다이얼로그 열기
  const handleOpenReschedule = () => {
    if (selectedMatch) {
      setRescheduleData({
        match_date: selectedMatch.match_date
          ? moment(selectedMatch.match_date).format('YYYY-MM-DDTHH:mm')
          : '',
        venue: selectedMatch.venue || '',
        estimated_duration: selectedMatch.estimated_duration || 90,
        reason: ''
      });
      setRescheduleDialog(true);
    }
    handleMenuClose();
  };

  // 재스케줄링 실행
  const handleReschedule = () => {
    if (!selectedMatch || !rescheduleData.match_date) return;

    rescheduleMutation.mutate({
      matchId: selectedMatch.id,
      scheduleData: rescheduleData
    });
  };

  // 페이지네이션 핸들러
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoading && !matchesData) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* 통계 카드 */}
      {stats && (
        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2} mb={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                전체 경기
              </Typography>
              <Typography variant="h4">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>

          {Object.entries(stats.byStatus || {}).map(([status, count]) => (
            <Card key={status}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  {statusConfig[status]?.icon}
                  <Typography variant="h6" color={statusConfig[status]?.color}>
                    {statusConfig[status]?.label}
                  </Typography>
                </Box>
                <Typography variant="h4">
                  {count}
                </Typography>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main" gutterBottom>
                완료율
              </Typography>
              <Typography variant="h4">
                {stats.completionRate}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={parseFloat(stats.completionRate)}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Box>
      )}

      {/* 필터 */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <FilterIcon color="action" />
        <Typography variant="subtitle2">상태별 필터:</Typography>
        {['all', 'pending', 'confirmed', 'conflicted', 'rescheduled'].map((status) => (
          <Chip
            key={status}
            label={status === 'all' ? '전체' : statusConfig[status]?.label}
            color={selectedStatus === status ? 'primary' : 'default'}
            onClick={() => {
              setSelectedStatus(status);
              setPage(0);
            }}
            size="small"
          />
        ))}
      </Box>

      {/* 경기 목록 테이블 */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>경기</TableCell>
                <TableCell>날짜/시간</TableCell>
                <TableCell>경기장</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>우선순위</TableCell>
                <TableCell align="center">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {matchesData?.matches?.map((match) => (
                <TableRow key={match.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">
                        {match.homeClub?.name} vs {match.awayClub?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {match.competition?.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {match.match_date ? (
                      <Box>
                        <Typography variant="body2">
                          {moment(match.match_date).format('YYYY-MM-DD')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {moment(match.match_date).format('HH:mm')}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        미정
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {match.venue || '미정'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statusConfig[match.scheduling_status]?.label}
                      color={statusConfig[match.scheduling_status]?.color}
                      size="small"
                      icon={statusConfig[match.scheduling_status]?.icon}
                    />
                    {match.conflict_reason && (
                      <Tooltip title={match.conflict_reason}>
                        <WarningIcon color="warning" fontSize="small" sx={{ ml: 1 }} />
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={match.priority}
                      size="small"
                      color={match.priority === 'high' ? 'error' :
                             match.priority === 'normal' ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, match)}
                      size="small"
                    >
                      <MoreIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={matchesData?.pagination?.total || 0}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="페이지당 행 수:"
        />
      </Card>

      {/* 액션 메뉴 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleOpenReschedule}>
          <EditIcon sx={{ mr: 1 }} />
          재스케줄링
        </MenuItem>
      </Menu>

      {/* 재스케줄링 다이얼로그 */}
      <Dialog open={rescheduleDialog} onClose={() => setRescheduleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>경기 재스케줄링</DialogTitle>
        <DialogContent>
          {selectedMatch && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                {selectedMatch.homeClub?.name} vs {selectedMatch.awayClub?.name}
              </Typography>

              <TextField
                fullWidth
                label="새로운 경기 날짜 및 시간"
                type="datetime-local"
                value={rescheduleData.match_date}
                onChange={(e) => setRescheduleData(prev => ({ ...prev, match_date: e.target.value }))}
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="경기장"
                value={rescheduleData.venue}
                onChange={(e) => setRescheduleData(prev => ({ ...prev, venue: e.target.value }))}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="예상 경기 시간 (분)"
                type="number"
                value={rescheduleData.estimated_duration}
                onChange={(e) => setRescheduleData(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) }))}
                inputProps={{ min: 30, max: 240 }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="재스케줄링 사유"
                multiline
                rows={3}
                value={rescheduleData.reason}
                onChange={(e) => setRescheduleData(prev => ({ ...prev, reason: e.target.value }))}
                required
              />

              {selectedMatch.conflict_reason && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  기존 충돌 사유: {selectedMatch.conflict_reason}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRescheduleDialog(false)}>
            취소
          </Button>
          <Button
            onClick={handleReschedule}
            variant="contained"
            disabled={rescheduleMutation.isPending || !rescheduleData.match_date || !rescheduleData.reason}
          >
            {rescheduleMutation.isPending ? '처리 중...' : '재스케줄링'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SchedulingStatus;