import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormControlLabel,
  Checkbox,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { schedulingAPI } from '../../services/schedulingAPI';
import moment from 'moment';

const AutoSchedulingDialog = ({ open, onClose, competitionId, competitionName }) => {
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(0);
  const [schedulingData, setSchedulingData] = useState({
    startDate: moment().add(1, 'day').format('YYYY-MM-DD'),
    endDate: moment().add(30, 'days').format('YYYY-MM-DD'),
    preferredTimes: ['14:00', '16:00', '18:00', '20:00'],
    excludeDays: [],
    venueIds: [],
    timezone: 'Asia/Seoul'
  });
  const [customTime, setCustomTime] = useState('');
  const [schedulingResult, setSchedulingResult] = useState(null);

  // 자동 스케줄링 실행 mutation
  const autoScheduleMutation = useMutation({
    mutationFn: (data) => schedulingAPI.autoScheduleMatches(competitionId, data),
    onSuccess: (response) => {
      setSchedulingResult(response.data.data);
      setActiveStep(2);
      queryClient.invalidateQueries(['competitionSchedule']);
    },
    onError: (error) => {
      console.error('Auto scheduling failed:', error);
    }
  });

  // 요일 옵션
  const dayOptions = [
    { value: 0, label: '일요일' },
    { value: 1, label: '월요일' },
    { value: 2, label: '화요일' },
    { value: 3, label: '수요일' },
    { value: 4, label: '목요일' },
    { value: 5, label: '금요일' },
    { value: 6, label: '토요일' }
  ];

  // 선호 시간 추가
  const handleAddPreferredTime = () => {
    if (customTime && !schedulingData.preferredTimes.includes(customTime)) {
      setSchedulingData(prev => ({
        ...prev,
        preferredTimes: [...prev.preferredTimes, customTime].sort()
      }));
      setCustomTime('');
    }
  };

  // 선호 시간 제거
  const handleRemovePreferredTime = (timeToRemove) => {
    setSchedulingData(prev => ({
      ...prev,
      preferredTimes: prev.preferredTimes.filter(time => time !== timeToRemove)
    }));
  };

  // 제외 요일 토글
  const handleToggleExcludeDay = (dayValue) => {
    setSchedulingData(prev => ({
      ...prev,
      excludeDays: prev.excludeDays.includes(dayValue)
        ? prev.excludeDays.filter(day => day !== dayValue)
        : [...prev.excludeDays, dayValue]
    }));
  };

  // 자동 스케줄링 실행
  const handleExecuteScheduling = () => {
    if (!schedulingData.startDate || !schedulingData.endDate) {
      return;
    }

    setActiveStep(1);
    autoScheduleMutation.mutate(schedulingData);
  };

  // 다이얼로그 닫기
  const handleClose = () => {
    setActiveStep(0);
    setSchedulingResult(null);
    onClose();
  };

  // 다음 단계
  const handleNext = () => {
    if (activeStep === 0) {
      handleExecuteScheduling();
    }
  };

  // 이전 단계
  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const steps = [
    '스케줄링 설정',
    '자동 스케줄링 실행',
    '결과 확인'
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        자동 스케줄링 - {competitionName}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ width: '100%' }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {/* Step 1: 설정 */}
            <Step>
              <StepLabel>스케줄링 설정</StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  {/* 기간 설정 */}
                  <Box display="flex" gap={2} mb={3}>
                    <TextField
                      label="시작일"
                      type="date"
                      value={schedulingData.startDate}
                      onChange={(e) => setSchedulingData(prev => ({ ...prev, startDate: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                    <TextField
                      label="종료일"
                      type="date"
                      value={schedulingData.endDate}
                      onChange={(e) => setSchedulingData(prev => ({ ...prev, endDate: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Box>

                  {/* 선호 시간대 */}
                  <Typography variant="subtitle2" gutterBottom>
                    선호 시간대
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                    {schedulingData.preferredTimes.map((time) => (
                      <Chip
                        key={time}
                        label={time}
                        onDelete={() => handleRemovePreferredTime(time)}
                        size="small"
                      />
                    ))}
                  </Box>

                  <Box display="flex" gap={1} mb={3}>
                    <TextField
                      label="시간 추가 (HH:MM)"
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                      placeholder="14:00"
                      size="small"
                    />
                    <Button onClick={handleAddPreferredTime} variant="outlined" size="small">
                      추가
                    </Button>
                  </Box>

                  {/* 제외 요일 */}
                  <Typography variant="subtitle2" gutterBottom>
                    제외할 요일
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
                    {dayOptions.map((day) => (
                      <FormControlLabel
                        key={day.value}
                        control={
                          <Checkbox
                            checked={schedulingData.excludeDays.includes(day.value)}
                            onChange={() => handleToggleExcludeDay(day.value)}
                          />
                        }
                        label={day.label}
                      />
                    ))}
                  </Box>

                  {/* 타임존 */}
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>타임존</InputLabel>
                    <Select
                      value={schedulingData.timezone}
                      onChange={(e) => setSchedulingData(prev => ({ ...prev, timezone: e.target.value }))}
                      label="타임존"
                    >
                      <MenuItem value="Asia/Seoul">대한민국 (KST)</MenuItem>
                      <MenuItem value="Asia/Tokyo">일본 (JST)</MenuItem>
                      <MenuItem value="Asia/Shanghai">중국 (CST)</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ mb: 1 }}>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ mt: 1, mr: 1 }}
                    disabled={!schedulingData.startDate || !schedulingData.endDate}
                  >
                    자동 스케줄링 실행
                  </Button>
                </Box>
              </StepContent>
            </Step>

            {/* Step 2: 실행 중 */}
            <Step>
              <StepLabel>자동 스케줄링 실행</StepLabel>
              <StepContent>
                <Box display="flex" alignItems="center" gap={2} py={3}>
                  <CircularProgress />
                  <Typography>
                    경기 스케줄을 자동으로 배정하고 있습니다...
                  </Typography>
                </Box>
              </StepContent>
            </Step>

            {/* Step 3: 결과 */}
            <Step>
              <StepLabel>결과 확인</StepLabel>
              <StepContent>
                {schedulingResult && (
                  <Box>
                    {/* 요약 통계 */}
                    <Box display="flex" gap={2} mb={3}>
                      <Alert severity="success" sx={{ flex: 1 }}>
                        <Typography variant="subtitle2">
                          성공: {schedulingResult.scheduledMatches?.length || 0}경기
                        </Typography>
                      </Alert>
                      {schedulingResult.conflictedMatches?.length > 0 && (
                        <Alert severity="warning" sx={{ flex: 1 }}>
                          <Typography variant="subtitle2">
                            충돌: {schedulingResult.conflictedMatches.length}경기
                          </Typography>
                        </Alert>
                      )}
                    </Box>

                    {/* 성공한 경기들 */}
                    {schedulingResult.scheduledMatches?.length > 0 && (
                      <Box mb={3}>
                        <Typography variant="h6" gutterBottom>
                          성공적으로 스케줄된 경기
                        </Typography>
                        <List dense>
                          {schedulingResult.scheduledMatches.slice(0, 5).map((match, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <CheckIcon color="success" />
                              </ListItemIcon>
                              <ListItemText
                                primary={`경기 #${match.matchId}`}
                                secondary={`${match.scheduledDate ? moment(match.scheduledDate).format('YYYY-MM-DD HH:mm') : 'N/A'} • ${match.venue || '장소 미정'}`}
                              />
                            </ListItem>
                          ))}
                          {schedulingResult.scheduledMatches.length > 5 && (
                            <ListItem>
                              <ListItemText
                                primary={`외 ${schedulingResult.scheduledMatches.length - 5}경기 더`}
                                sx={{ textAlign: 'center', fontStyle: 'italic' }}
                              />
                            </ListItem>
                          )}
                        </List>
                      </Box>
                    )}

                    {/* 충돌된 경기들 */}
                    {schedulingResult.conflictedMatches?.length > 0 && (
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          스케줄 충돌 경기
                        </Typography>
                        <List dense>
                          {schedulingResult.conflictedMatches.slice(0, 5).map((match, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <WarningIcon color="warning" />
                              </ListItemIcon>
                              <ListItemText
                                primary={`경기 #${match.matchId}`}
                                secondary={match.reason}
                              />
                            </ListItem>
                          ))}
                          {schedulingResult.conflictedMatches.length > 5 && (
                            <ListItem>
                              <ListItemText
                                primary={`외 ${schedulingResult.conflictedMatches.length - 5}경기 더`}
                                sx={{ textAlign: 'center', fontStyle: 'italic' }}
                              />
                            </ListItem>
                          )}
                        </List>
                      </Box>
                    )}
                  </Box>
                )}
              </StepContent>
            </Step>
          </Stepper>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          {activeStep === 2 ? '완료' : '취소'}
        </Button>
        {activeStep > 0 && activeStep < 2 && (
          <Button onClick={handleBack}>
            이전
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AutoSchedulingDialog;