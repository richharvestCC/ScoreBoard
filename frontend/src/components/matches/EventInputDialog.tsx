import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Controller, useForm } from 'react-hook-form';
import type { EventType } from './RadialEventMenu';
import type { FieldClick } from './InteractiveField';
import type { Team, Player, MatchEvent } from '../../types/match';
import { getSpecialRulesForZoneEvent } from './FieldZoneRules';

// Simple validation function
const validateForm = (data: EventFormData) => {
  const errors: Partial<Record<keyof EventFormData, string>> = {};

  if (!data.teamId) errors.teamId = '팀을 선택해주세요';
  if (!data.playerId) errors.playerId = '선수를 선택해주세요';
  if (data.minute < 0 || data.minute > 130) errors.minute = '분은 0에서 130 사이여야 합니다';
  if (data.description && data.description.length > 200) errors.description = '설명은 200자 이하여야 합니다';

  return {
    values: Object.keys(errors).length === 0 ? data : {},
    errors
  };
};

// Define the form data interface explicitly to match our needs
export interface EventFormData {
  teamId: string;
  playerId: string;
  assistPlayerId?: string | null;
  minute: number;
  description: string;

  // Zone-specific special fields
  violationType?: string;
  warning?: boolean;
  ejection?: boolean;
  homeTeamEvent?: boolean;
  freeKickType?: 'direct' | 'indirect';
  kicker?: string;
  lastTouch?: string;
  attacker?: string;
  defender?: string;
  timeCapture?: string;
}

interface EventInputDialogProps {
  open: boolean;
  eventType: EventType | null;
  clickData: FieldClick | null;
  homeTeam: Team;
  awayTeam: Team;
  currentPeriod: number;
  currentMinute: number;
  matchId: string;
  onClose: () => void;
  onSubmit: (eventData: MatchEvent) => Promise<void> | void;
}

const getActivePlayers = (players: Player[]) => players.filter((player) => player.isActive);

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
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<EventFormData>({
    defaultValues: {
      teamId: '',
      playerId: '',
      assistPlayerId: null,
      minute: currentMinute,
      description: '',
      warning: false,
      ejection: false,
      homeTeamEvent: true,
      freeKickType: 'direct',
      violationType: '',
      kicker: '',
      lastTouch: '',
      attacker: '',
      defender: '',
      timeCapture: '',
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
    { value: 'unsporting', label: '비신사적 행위' },
    { value: 'delaying', label: '지연 행위' },
  ];

  useEffect(() => {
    if (watchedTeam) {
      const team = watchedTeam === homeTeam.id ? homeTeam : awayTeam;
      setSelectedTeam(team);
    }
  }, [watchedTeam, homeTeam, awayTeam]);

  useEffect(() => {
    if (open) {
      reset({
        teamId: '',
        playerId: '',
        assistPlayerId: null,
        minute: currentMinute,
        description: '',
        warning: false,
        ejection: false,
        homeTeamEvent: true,
        freeKickType: 'direct',
        violationType: '',
        kicker: '',
        lastTouch: '',
        attacker: '',
        defender: '',
        timeCapture: '',
      });
      setSelectedTeam(null);
    }
  }, [open, currentMinute, reset]);

  const handleFormSubmit = async (data: EventFormData) => {
    if (!eventType || !clickData) return;

    setSubmitting(true);

    try {
      const eventData: MatchEvent = {
        id: `event-${Date.now()}`,
        matchId,
        teamId: data.teamId,
        playerId: data.playerId,
        assistPlayerId: data.assistPlayerId,
        eventType: eventType.name,
        minute: data.minute,
        period: currentPeriod,
        coordinates: {
          x: clickData.x,
          y: clickData.y,
          zone: clickData.zone.name,
        },
        description: data.description,
        // 특수 필드들도 포함 (필요한 경우)
        metadata: {
          violationType: data.violationType,
          warning: data.warning,
          ejection: data.ejection,
          homeTeamEvent: data.homeTeamEvent,
          freeKickType: data.freeKickType,
          kicker: data.kicker,
          lastTouch: data.lastTouch,
          attacker: data.attacker,
          defender: data.defender,
          timeCapture: data.timeCapture,
        }
      };

      await onSubmit(eventData);
      onClose();
    } catch (error) {
      console.error('Event submission failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTimeCapture = () => {
    const currentTime = new Date().toLocaleTimeString();
    // You would update the form field here
    console.log('Time captured:', currentTime);
  };

  if (!eventType || !clickData) return null;

  const activePlayers = selectedTeam ? getActivePlayers(selectedTeam.players) : [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="h6" component="div" fontWeight={600}>
              {eventType.name} 이벤트 입력
            </Typography>
            <Chip label={`${currentPeriod}P ${currentMinute}'`} size="small" color="primary" />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {clickData.zone.name} • ({clickData.x.toFixed(1)}%, {clickData.y.toFixed(1)}%)
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 4, py: 3 }}>
          <Alert severity="info" variant="outlined">
            현재 시간 <strong>{currentPeriod}P {currentMinute}'</strong>
            에 <strong>{clickData.zone.name}</strong> 구역에서 발생한 이벤트입니다.
          </Alert>

          {/* 기본 이벤트 정보 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* 팀 선택 */}
            <FormControl fullWidth required>
              <InputLabel>팀</InputLabel>
              <Controller
                name="teamId"
                control={control}
                rules={{ required: '팀을 선택해주세요' }}
                render={({ field, fieldState }) => (
                  <Select
                    {...field}
                    label="팀"
                    error={!!fieldState.error}
                  >
                    <MenuItem value={homeTeam.id}>{homeTeam.name} (홈)</MenuItem>
                    <MenuItem value={awayTeam.id}>{awayTeam.name} (어웨이)</MenuItem>
                  </Select>
                )}
              />
              {errors.teamId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.teamId.message}
                </Typography>
              )}
            </FormControl>

            {/* 선수 선택 */}
            <FormControl fullWidth required>
              <InputLabel>선수</InputLabel>
              <Controller
                name="playerId"
                control={control}
                rules={{ required: '선수를 선택해주세요' }}
                render={({ field, fieldState }) => (
                  <Select
                    {...field}
                    label="선수"
                    disabled={!selectedTeam}
                    error={!!fieldState.error}
                  >
                    {activePlayers.map((player) => (
                      <MenuItem key={player.id} value={player.id}>
                        {player.number}번 {player.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.playerId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.playerId.message}
                </Typography>
              )}
            </FormControl>

            {/* 어시스트 선수 (득점인 경우) */}
            {needsAssist && (
              <FormControl fullWidth>
                <InputLabel>어시스트 선수</InputLabel>
                <Controller
                  name="assistPlayerId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      value={field.value || ''}
                      label="어시스트 선수"
                      disabled={!selectedTeam}
                    >
                      <MenuItem value="">선택 안함</MenuItem>
                      {activePlayers
                        .filter((player) => player.id !== selectedPlayerId)
                        .map((player) => (
                          <MenuItem key={player.id} value={player.id}>
                            {player.number}번 {player.name}
                          </MenuItem>
                        ))}
                    </Select>
                  )}
                />
              </FormControl>
            )}

            {/* 시간 */}
            <Controller
              name="minute"
              control={control}
              rules={{
                required: '시간을 입력해주세요',
                min: { value: 0, message: '시간은 0 이상이어야 합니다' },
                max: { value: 130, message: '시간은 130 이하여야 합니다' },
              }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="시간 (분)"
                  type="number"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />

            {/* 설명 */}
            <Controller
              name="description"
              control={control}
              rules={{
                required: '설명을 입력해주세요',
                maxLength: { value: 200, message: '설명은 200자 이하여야 합니다' },
              }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="설명"
                  multiline
                  rows={3}
                  fullWidth
                  placeholder="이벤트에 대한 상세 설명을 입력해주세요"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Box>

          {/* 특수 규칙 필드들 */}
          {specialRules && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Divider>
                <Chip label="추가 정보" size="small" />
              </Divider>

              {/* 반칙 종류 선택 */}
              {eventType?.id === 'violation' && (
                <FormControl fullWidth>
                  <InputLabel>반칙 종류</InputLabel>
                  <Controller
                    name="violationType"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="반칙 종류">
                        {violationTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>
              )}

              {/* 프리킥 타입 */}
              {eventType?.id === 'freekick' && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    프리킥 종류
                  </Typography>
                  <Controller
                    name="freeKickType"
                    control={control}
                    render={({ field }) => (
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant={field.value === 'direct' ? 'contained' : 'outlined'}
                          onClick={() => field.onChange('direct')}
                        >
                          직접 프리킥
                        </Button>
                        <Button
                          variant={field.value === 'indirect' ? 'contained' : 'outlined'}
                          onClick={() => field.onChange('indirect')}
                        >
                          간접 프리킥
                        </Button>
                      </Box>
                    )}
                  />
                </Box>
              )}

              {/* 코너킥 시간 캡처 */}
              {eventType?.id === 'corner_kick' && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    시간 기록
                  </Typography>
                  <Controller
                    name="timeCapture"
                    control={control}
                    render={({ field }) => (
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField
                          {...field}
                          label="시간"
                          size="small"
                          sx={{ flex: 1 }}
                        />
                        <Button
                          variant="outlined"
                          onClick={handleTimeCapture}
                          size="small"
                        >
                          현재 시간
                        </Button>
                      </Box>
                    )}
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={submitting}>
            취소
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            sx={{ minWidth: 100 }}
          >
            {submitting ? '저장 중...' : '저장'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EventInputDialog;