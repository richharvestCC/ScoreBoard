import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
  Box,
  Chip,
  IconButton,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useForm, Controller } from 'react-hook-form';
import { Player, Team } from '../../types/match';
import { getSpecialRulesForZoneEvent } from './FieldZoneRules';

export interface EventFormData {
  teamId: string;
  playerId: string;
  assistPlayerId?: string;
  keypassPlayerId?: string;
  minute: number;
  violationType?: string;
  kickType?: string;
  details?: string;
}

export interface ClickData {
  x: number;
  y: number;
  zone: {
    id: string;
    name: string;
  };
}

export interface EventType {
  id: string;
  name: string;
  color: string;
}

interface EventInputDialogProps {
  open: boolean;
  eventType: EventType | null;
  clickData: ClickData | null;
  homeTeam: Team;
  awayTeam: Team;
  currentPeriod: number;
  currentMinute: number;
  matchId: string;
  onClose: () => void;
  onSubmit: (eventData: any) => void;
  onRequestCoordinate?: (type: 'assist' | 'keypass') => void;
  onCoordinateSelected?: (coordinate: {x: number, y: number, zone: string}) => void;
}

// 활성 선수 필터링 함수
const getActivePlayers = (players: Player[]): Player[] => {
  return players.filter(player => player.isActive);
};

export const EventInputDialog: React.FC<EventInputDialogProps> = ({
  open,
  eventType,
  clickData,
  homeTeam,
  awayTeam,
  currentPeriod,
  currentMinute,
  matchId,
  onClose,
  onSubmit,
  onRequestCoordinate,
  onCoordinateSelected,
}) => {
  // Goal workflow state
  const [goalWorkflowStep, setGoalWorkflowStep] = useState<'goal' | 'assist' | 'keypass' | 'complete'>('goal');
  const [goalData, setGoalData] = useState<Partial<EventFormData> | null>(null);
  const [waitingForCoordinate, setWaitingForCoordinate] = useState<'assist' | 'keypass' | null>(null);
  const [assistCoordinate, setAssistCoordinate] = useState<{x: number, y: number, zone: string} | null>(null);
  const [keypassCoordinate, setKeypassCoordinate] = useState<{x: number, y: number, zone: string} | null>(null);

  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<EventFormData>({
    defaultValues: {
      teamId: '',
      playerId: '',
      minute: currentMinute,
    },
  });

  const watchedTeam = watch('teamId');
  const selectedPlayerId = watch('playerId');
  const needsAssist = eventType?.id === 'goal';

  // 특수 규칙 확인
  const specialRules = useMemo(() => {
    if (!eventType || !clickData) return null;
    return getSpecialRulesForZoneEvent(clickData.zone.id, eventType.id);
  }, [eventType, clickData]);

  // 반칙 종류 옵션들
  const violationTypes = [
    { value: 'handball', label: '핸드볼' },
    { value: 'dangerous_play', label: '위험한 플레이' },
    { value: 'impeding', label: '방해' },
    { value: 'dissent', label: '항의' },
    { value: 'unsporting_behavior', label: '비신사적 행위' },
    { value: 'time_wasting', label: '시간 끌기' },
    { value: 'offside', label: '오프사이드' },
    { value: 'rough_play', label: '거친 플레이' },
  ];

  const selectedTeam = watchedTeam === homeTeam.id ? homeTeam : watchedTeam === awayTeam.id ? awayTeam : null;
  const activePlayers = selectedTeam ? getActivePlayers(selectedTeam.players) : [];

  // Handle coordinate selection
  useEffect(() => {
    if (onCoordinateSelected && waitingForCoordinate) {
      const handleCoordinateSelect = (coordinate: {x: number, y: number, zone: string}) => {
        if (waitingForCoordinate === 'assist') {
          setAssistCoordinate(coordinate);
          setGoalWorkflowStep('assist');
        } else if (waitingForCoordinate === 'keypass') {
          setKeypassCoordinate(coordinate);
          setGoalWorkflowStep('keypass');
        }
        setWaitingForCoordinate(null);
      };

      // This is a placeholder - actual coordinate handling would be done by parent component
      // onCoordinateSelected(handleCoordinateSelect);
    }
  }, [waitingForCoordinate, onCoordinateSelected]);

  // Goal workflow handlers
  const handleGoalSubmit = (data: EventFormData) => {
    if (!data.teamId || !data.playerId || data.minute === undefined) {
      return;
    }

    const goalEventData = {
      id: `event-${Date.now()}`,
      matchId,
      teamId: data.teamId,
      playerId: data.playerId,
      assistPlayerId: null,
      eventType: 'goal',
      minute: data.minute,
      period: currentPeriod,
      coordinates: {
        x: clickData!.x,
        y: clickData!.y,
        zoneId: clickData!.zone.id,
      },
      details: data.details || null,
    };

    setGoalData(data);
    setGoalWorkflowStep('assist');
  };

  const handleAssistClick = () => {
    if (onRequestCoordinate) {
      setWaitingForCoordinate('assist');
      onRequestCoordinate('assist');
      // Dialog will close temporarily for coordinate selection
    }
  };

  const handleKeypassClick = () => {
    if (onRequestCoordinate) {
      setWaitingForCoordinate('keypass');
      onRequestCoordinate('keypass');
      // Dialog will close temporarily for coordinate selection
    }
  };

  const handleSkipAssist = () => {
    setGoalWorkflowStep('keypass');
  };

  const handleSkipKeypass = () => {
    setGoalWorkflowStep('complete');
    handleFinalRegistration();
  };

  const handleAssistPlayerSelect = (playerId: string) => {
    if (goalData && assistCoordinate) {
      const assistEventData = {
        id: `event-${Date.now()}-assist`,
        matchId,
        teamId: goalData.teamId!,
        playerId: playerId,
        assistPlayerId: null,
        eventType: 'assist',
        minute: goalData.minute!,
        period: currentPeriod,
        coordinates: {
          x: assistCoordinate.x,
          y: assistCoordinate.y,
          zoneId: assistCoordinate.zone,
        },
        details: null,
      };

      setGoalData({ ...goalData, assistPlayerId: playerId });
      setGoalWorkflowStep('keypass');
    }
  };

  const handleKeypassPlayerSelect = (playerId: string) => {
    if (goalData && keypassCoordinate) {
      const keypassEventData = {
        id: `event-${Date.now()}-keypass`,
        matchId,
        teamId: goalData.teamId!,
        playerId: playerId,
        assistPlayerId: null,
        eventType: 'keypass',
        minute: goalData.minute!,
        period: currentPeriod,
        coordinates: {
          x: keypassCoordinate.x,
          y: keypassCoordinate.y,
          zoneId: keypassCoordinate.zone,
        },
        details: null,
      };

      setGoalData({ ...goalData, keypassPlayerId: playerId });
      setGoalWorkflowStep('complete');
      handleFinalRegistration();
    }
  };

  const handleFinalRegistration = () => {
    if (!goalData) return;

    // Submit all events in sequence
    const events = [];

    // 1. Goal event
    const goalEvent = {
      id: `event-${Date.now()}`,
      matchId,
      teamId: goalData.teamId!,
      playerId: goalData.playerId!,
      assistPlayerId: goalData.assistPlayerId || null,
      eventType: 'goal',
      minute: goalData.minute!,
      period: currentPeriod,
      coordinates: {
        x: clickData!.x,
        y: clickData!.y,
        zoneId: clickData!.zone.id,
      },
      details: goalData.details || null,
    };
    events.push(goalEvent);

    // 2. Assist event if exists
    if (goalData.assistPlayerId && assistCoordinate) {
      const assistEvent = {
        id: `event-${Date.now()}-assist`,
        matchId,
        teamId: goalData.teamId!,
        playerId: goalData.assistPlayerId,
        assistPlayerId: null,
        eventType: 'assist',
        minute: goalData.minute!,
        period: currentPeriod,
        coordinates: {
          x: assistCoordinate.x,
          y: assistCoordinate.y,
          zoneId: assistCoordinate.zone,
        },
        details: null,
      };
      events.push(assistEvent);
    }

    // 3. Keypass event if exists
    if (goalData.keypassPlayerId && keypassCoordinate) {
      const keypassEvent = {
        id: `event-${Date.now()}-keypass`,
        matchId,
        teamId: goalData.teamId!,
        playerId: goalData.keypassPlayerId,
        assistPlayerId: null,
        eventType: 'keypass',
        minute: goalData.minute!,
        period: currentPeriod,
        coordinates: {
          x: keypassCoordinate.x,
          y: keypassCoordinate.y,
          zoneId: keypassCoordinate.zone,
        },
        details: null,
      };
      events.push(keypassEvent);
    }

    // Submit all events
    events.forEach(event => onSubmit(event));
    onClose();
    resetWorkflow();
  };

  const resetWorkflow = () => {
    setGoalWorkflowStep('goal');
    setGoalData(null);
    setAssistCoordinate(null);
    setKeypassCoordinate(null);
    setWaitingForCoordinate(null);
    reset();
  };

  // Regular event submission
  const onSubmitRegular = (data: EventFormData) => {
    if (!eventType || !clickData) return;

    const eventData = {
      id: `event-${Date.now()}`,
      matchId,
      teamId: data.teamId,
      playerId: data.playerId,
      assistPlayerId: data.assistPlayerId || null,
      eventType: eventType.id,
      minute: data.minute,
      period: currentPeriod,
      coordinates: {
        x: clickData.x,
        y: clickData.y,
        zoneId: clickData.zone.id,
      },
      details: data.details || null,
      violationType: data.violationType || null,
      kickType: data.kickType || null,
    };

    onSubmit(eventData);
    onClose();
  };

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open && eventType && clickData) {
      reset({
        teamId: '',
        playerId: '',
        minute: currentMinute,
      });

      if (eventType.id === 'goal') {
        resetWorkflow();
      }
    }
  }, [open, eventType, clickData, currentMinute, reset]);

  if (!eventType || !clickData) return null;

  // Goal workflow UI
  if (eventType.id === 'goal') {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          득점 기록 {goalWorkflowStep === 'assist' ? '- 어시스트' : goalWorkflowStep === 'keypass' ? '- 기점' : ''}
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {goalWorkflowStep === 'goal' && (
            <Box component="form" onSubmit={handleSubmit(handleGoalSubmit)}>
              <Stack spacing={3}>
                <Typography variant="body2" color="text.secondary">
                  구역: {clickData.zone.name} ({clickData.x.toFixed(1)}, {clickData.y.toFixed(1)})
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Controller
                    name="teamId"
                    control={control}
                    rules={{ required: '팀을 선택해주세요' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label="팀"
                        fullWidth
                        error={!!errors.teamId}
                        helperText={errors.teamId?.message}
                      >
                        <MenuItem value={homeTeam.id}>{homeTeam.name}</MenuItem>
                        <MenuItem value={awayTeam.id}>{awayTeam.name}</MenuItem>
                      </TextField>
                    )}
                  />

                  <Controller
                    name="minute"
                    control={control}
                    rules={{ required: '시간을 입력해주세요', min: 0, max: 120 }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="number"
                        label="시간 (분)"
                        fullWidth
                        error={!!errors.minute}
                        helperText={errors.minute?.message}
                      />
                    )}
                  />
                </Box>

                {activePlayers.length > 0 && (
                  <Controller
                    name="playerId"
                    control={control}
                    rules={{ required: '선수를 선택해주세요' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label="득점 선수"
                        fullWidth
                        error={!!errors.playerId}
                        helperText={errors.playerId?.message}
                      >
                        {activePlayers.map((player) => (
                          <MenuItem key={player.id} value={player.id}>
                            #{player.number} {player.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                )}

                <Controller
                  name="details"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      multiline
                      rows={2}
                      label="세부사항 (선택사항)"
                      fullWidth
                    />
                  )}
                />
              </Stack>

              <DialogActions sx={{ px: 0, pt: 3 }}>
                <Button onClick={onClose} variant="outlined">
                  취소
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  다음 (어시스트 설정)
                </Button>
              </DialogActions>
            </Box>
          )}

          {goalWorkflowStep === 'assist' && (
            <Box>
              <Typography variant="body1" gutterBottom>
                어시스트를 기록하시겠습니까?
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                어시스트를 추가하려면 좌표를 클릭하고 선수를 선택해주세요.
              </Typography>

              {assistCoordinate ? (
                <Box>
                  <Typography variant="body2" mb={2}>
                    어시스트 위치: ({assistCoordinate.x.toFixed(1)}, {assistCoordinate.y.toFixed(1)})
                  </Typography>
                  <Typography variant="body1" mb={2}>어시스트 선수를 선택해주세요:</Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {activePlayers.map((player) => (
                      <Chip
                        key={player.id}
                        label={`#${player.number} ${player.name}`}
                        onClick={() => handleAssistPlayerSelect(player.id)}
                        clickable
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Button
                    variant="contained"
                    onClick={handleAssistClick}
                    sx={{ mr: 2 }}
                  >
                    어시스트 위치 선택
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleSkipAssist}
                  >
                    어시스트 없음
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {goalWorkflowStep === 'keypass' && (
            <Box>
              <Typography variant="body1" gutterBottom>
                기점을 기록하시겠습니까?
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                기점을 추가하려면 좌표를 클릭하고 선수를 선택해주세요.
              </Typography>

              {keypassCoordinate ? (
                <Box>
                  <Typography variant="body2" mb={2}>
                    기점 위치: ({keypassCoordinate.x.toFixed(1)}, {keypassCoordinate.y.toFixed(1)})
                  </Typography>
                  <Typography variant="body1" mb={2}>기점 선수를 선택해주세요:</Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {activePlayers.map((player) => (
                      <Chip
                        key={player.id}
                        label={`#${player.number} ${player.name}`}
                        onClick={() => handleKeypassPlayerSelect(player.id)}
                        clickable
                        color="secondary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Button
                    variant="contained"
                    onClick={handleKeypassClick}
                    sx={{ mr: 2 }}
                  >
                    기점 위치 선택
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleSkipKeypass}
                  >
                    기점 없음
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  // Regular event dialog
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          {eventType.name} 기록
          <Typography variant="body2" color="text.secondary">
            구역: {clickData.zone.name} ({clickData.x.toFixed(1)}, {clickData.y.toFixed(1)})
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box component="form" onSubmit={handleSubmit(onSubmitRegular)}>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Controller
                name="teamId"
                control={control}
                rules={{ required: '팀을 선택해주세요' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="팀"
                    fullWidth
                    error={!!errors.teamId}
                    helperText={errors.teamId?.message}
                  >
                    <MenuItem value={homeTeam.id}>{homeTeam.name}</MenuItem>
                    <MenuItem value={awayTeam.id}>{awayTeam.name}</MenuItem>
                  </TextField>
                )}
              />

              <Controller
                name="minute"
                control={control}
                rules={{ required: '시간을 입력해주세요', min: 0, max: 120 }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="시간 (분)"
                    fullWidth
                    error={!!errors.minute}
                    helperText={errors.minute?.message}
                  />
                )}
              />
            </Box>

            {activePlayers.length > 0 && (
              <Controller
                name="playerId"
                control={control}
                rules={{ required: '선수를 선택해주세요' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="선수"
                    fullWidth
                    error={!!errors.playerId}
                    helperText={errors.playerId?.message}
                  >
                    {activePlayers.map((player) => (
                      <MenuItem key={player.id} value={player.id}>
                        #{player.number} {player.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            )}

            {(eventType.id === 'violation' || eventType.id === 'foul') && (
              <Controller
                name="violationType"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="반칙 종류"
                    fullWidth
                  >
                    {violationTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            )}

            {eventType.id === 'freekick' && (
              <Controller
                name="kickType"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="킥 종류"
                    fullWidth
                  >
                    <MenuItem value="direct">직접 프리킥</MenuItem>
                    <MenuItem value="indirect">간접 프리킥</MenuItem>
                  </TextField>
                )}
              />
            )}

            <Controller
              name="details"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  multiline
                  rows={2}
                  label="세부사항 (선택사항)"
                  fullWidth
                />
              )}
            />
          </Stack>

          <DialogActions sx={{ px: 0, pt: 3 }}>
            <Button onClick={onClose} variant="outlined">
              취소
            </Button>
            <Button type="submit" variant="contained" color="primary">
              기록
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default EventInputDialog;