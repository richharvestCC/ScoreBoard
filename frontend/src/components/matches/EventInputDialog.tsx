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
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { EventType } from './RadialEventMenu';
import type { FieldClick } from './InteractiveField';
import type { Team, Player, MatchEvent } from '../../types/match';

const eventValidationSchema = yup
  .object({
    teamId: yup.string().required('팀을 선택해주세요'),
    playerId: yup.string().required('선수를 선택해주세요'),
    assistPlayerId: yup.string().nullable().default(null).defined(),
    minute: yup
      .number()
      .typeError('시간은 숫자로 입력해주세요')
      .min(0, '분은 0 이상이어야 합니다')
      .max(130, '분은 130 이하여야 합니다')
      .required('시간을 입력해주세요'),
    description: yup.string().max(200, '설명은 200자 이하여야 합니다').default('').defined(),
  })
  .required();

export type EventFormData = yup.InferType<typeof eventValidationSchema>;

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
    resolver: yupResolver(eventValidationSchema),
    defaultValues: {
      teamId: '',
      playerId: '',
      assistPlayerId: null,
      minute: currentMinute,
      description: '',
    },
  });

  const watchedTeam = watch('teamId');
  const selectedPlayerId = watch('playerId');
  const needsAssist = eventType?.id === 'goal';

  useEffect(() => {
    if (watchedTeam) {
      const team = watchedTeam === homeTeam.id ? homeTeam : awayTeam;
      setSelectedTeam(team);
    } else {
      setSelectedTeam(null);
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
      });
      setSelectedTeam(null);
    }
  }, [open, currentMinute, reset]);

  const assistOptions = useMemo(() => {
    if (!selectedTeam) {
      return [] as Player[];
    }

    return getActivePlayers(selectedTeam.players).filter((player) => player.id !== selectedPlayerId);
  }, [selectedTeam, selectedPlayerId]);

  const handleFormSubmit = async (data: EventFormData) => {
    if (!eventType || !clickData) {
      return;
    }

    setSubmitting(true);
    try {
      const eventPayload: MatchEvent = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        matchId,
        teamId: data.teamId,
        playerId: data.playerId,
        assistPlayerId: data.assistPlayerId ?? undefined,
        eventType: eventType.id,
        coordinates: {
          x: clickData.x,
          y: clickData.y,
          zone: clickData.zone.id,
        },
        period: currentPeriod,
        minute: data.minute,
        description: data.description?.trim() ? data.description : undefined,
        createdAt: new Date().toISOString(),
      };

      await onSubmit(eventPayload);
      onClose();
    } catch (error) {
      console.error('이벤트 저장 실패', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!eventType || !clickData) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          pb: 1,
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: eventType.color,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
            }}
          >
            {eventType.icon}
          </Box>
          <Box>
            <Typography variant="h6">{eventType.name} 기록</Typography>
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
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Alert severity="info" variant="outlined">
            현재 시간 <strong>{currentPeriod}P {currentMinute}'</strong>
          </Alert>

          <FormControl fullWidth error={!!errors.teamId}>
            <InputLabel>팀 선택</InputLabel>
            <Controller
              name="teamId"
              control={control}
              render={({ field }) => (
                <Select {...field} label="팀 선택">
                  <MenuItem value={homeTeam.id}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip size="small" label="HOME" sx={{ backgroundColor: homeTeam.color, color: 'white' }} />
                      {homeTeam.name}
                    </Box>
                  </MenuItem>
                  <MenuItem value={awayTeam.id}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip size="small" label="AWAY" sx={{ backgroundColor: awayTeam.color, color: 'white' }} />
                      {awayTeam.name}
                    </Box>
                  </MenuItem>
                </Select>
              )}
            />
            {errors.teamId && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {errors.teamId.message}
              </Typography>
            )}
          </FormControl>

          <FormControl fullWidth error={!!errors.playerId} disabled={!selectedTeam}>
            <InputLabel>선수 선택</InputLabel>
            <Controller
              name="playerId"
              control={control}
              render={({ field }) => (
                <Select {...field} label="선수 선택">
                  {selectedTeam &&
                    getActivePlayers(selectedTeam.players).map((player) => (
                      <MenuItem key={player.id} value={player.id}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip size="small" label={player.number} variant="outlined" />
                          <Box>
                            <Typography variant="body2">{player.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {player.position}
                            </Typography>
                          </Box>
                        </Box>
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

          {needsAssist && (
            <FormControl fullWidth disabled={!selectedTeam}>
              <InputLabel>도움 선수 (선택 사항)</InputLabel>
              <Controller
                name="assistPlayerId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={field.value ?? ''}
                    onChange={(event) => {
                      const value = event.target.value;
                      field.onChange(value === '' ? null : value);
                    }}
                    label="도움 선수 (선택 사항)"
                  >
                    <MenuItem value="">
                      <em>도움 없음</em>
                    </MenuItem>
                    {assistOptions.map((player) => (
                      <MenuItem key={player.id} value={player.id}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip size="small" label={player.number} variant="outlined" />
                          {player.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          )}

          <Divider />

          <Controller
            name="minute"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="경기 시간 (분)"
                fullWidth
                inputProps={{ min: 0, max: 130 }}
                error={!!errors.minute}
                helperText={errors.minute?.message}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="추가 설명 (선택 사항)"
                multiline
                rows={3}
                fullWidth
                inputProps={{ maxLength: 200 }}
              />
            )}
          />

          <Card variant="outlined">
            <CardContent sx={{ py: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                이벤트는 즉시 경기 기록으로 반영되며, 모든 데이터는 추후 수정이 가능합니다.
              </Typography>
            </CardContent>
          </Card>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>취소</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? '저장 중...' : '저장'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EventInputDialog;
