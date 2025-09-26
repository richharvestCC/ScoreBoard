import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Typography,
  Alert,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import InteractiveField, { FieldClick } from '../components/matches/InteractiveField';
import RadialEventMenu, { EventType } from '../components/matches/RadialEventMenu';
import EventInputDialog from '../components/matches/EventInputDialog';
import type { MatchEvent, Team } from '../types/match';
import { createEvent, CreateEventPayload } from '../services/events';

const EVENT_TYPES: EventType[] = [
  { id: 'goal', name: '득점', color: '#f44336', icon: '🥅' },
  { id: 'shot', name: '슈팅', color: '#1976d2', icon: '⚽' },
  { id: 'yellow', name: '경고', color: '#ffb300', icon: '🟨' },
  { id: 'red', name: '퇴장', color: '#d32f2f', icon: '🟥' },
  { id: 'foul', name: '파울', color: '#8d6e63', icon: '🚫' },
  { id: 'injury', name: '부상', color: '#ab47bc', icon: '✚' },
  { id: 'substitution', name: '교체', color: '#26a69a', icon: '🔄' },
];

const createDemoTeam = (prefix: 'HOME' | 'AWAY', color: string, name: string): Team => ({
  id: prefix.toLowerCase(),
  name,
  shortName: prefix,
  color,
  players: Array.from({ length: 7 }).map((_, index) => ({
    id: `${prefix}-${index + 1}`,
    name: `${index + 2}0번 선수`,
    number: index + 2,
    position: index < 2 ? 'DF' : index < 4 ? 'MF' : 'FW',
    isActive: true,
  })),
});

const homeTeam = createDemoTeam('HOME', '#1976d2', '서울 드림즈');
const awayTeam = createDemoTeam('AWAY', '#d32f2f', '부산 파이어즈');

const MatchRecordPage: React.FC = () => {
  const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number } | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
  const [fieldClick, setFieldClick] = useState<FieldClick | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const currentPeriod = 1;
  const currentMinute = 12;
  const matchId = 'demo-match-001';

  const mutation = useMutation({
    mutationFn: (payload: CreateEventPayload) => createEvent(payload),
    onError: () => {
      setSnackbar('이벤트는 로컬에 저장되었지만 서버 전송에 실패했습니다. 나중에 다시 동기화 해주세요.');
    },
  });

  const handleFieldClick = (click: FieldClick) => {
    setFieldClick(click);
    setMenuAnchor({ x: click.x, y: click.y });
    setSelectedEventType(null);
  };

  const handleEventTypeSelect = (event: EventType) => {
    setSelectedEventType(event);
  };

  const handleEventSubmit = async (event: MatchEvent) => {
    setEvents((prev) => [event, ...prev]);

    const payload: CreateEventPayload = {
      matchId: event.matchId,
      teamId: event.teamId,
      playerId: event.playerId,
      assistPlayerId: event.assistPlayerId,
      eventType: event.eventType,
      minute: event.minute,
      description: event.description,
      coordinates: event.coordinates,
      period: event.period,
    };

    await mutation.mutateAsync(payload).catch(() => {
      /* handled in onError */
    });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        인터랙티브 경기 기록 실험
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        필드를 클릭하면 이벤트 메뉴가 나타나고, 선택한 이벤트는 팀/선수 상세 정보를 입력한 뒤 저장됩니다.
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 4,
          alignItems: 'stretch',
        }}
      >
        <Box sx={{ flex: { xs: '1 1 auto', md: '0 0 60%' }, position: 'relative' }}>
          <InteractiveField onZoneClick={handleFieldClick} />
          <RadialEventMenu
            open={Boolean(menuAnchor) && !selectedEventType}
            anchor={menuAnchor}
            events={EVENT_TYPES}
            onSelect={handleEventTypeSelect}
            onClose={() => setMenuAnchor(null)}
          />
        </Box>

        <Box sx={{ flex: { xs: '1 1 auto', md: '0 0 40%' } }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                경기 이벤트 로그
              </Typography>
              {events.length === 0 ? (
                <Alert severity="info" variant="outlined">
                  아직 기록된 이벤트가 없습니다. 필드를 클릭해 첫 이벤트를 기록해보세요.
                </Alert>
              ) : (
                <List>
                  {events.map((event) => (
                    <React.Fragment key={event.id}>
                      <ListItem alignItems="flex-start" sx={{ alignItems: 'center', gap: 1 }}>
                        <ListItemText
                          primary={`${event.minute}' ${event.eventType}`}
                          secondary={`팀: ${event.teamId} • 선수: ${event.playerId} • 그리드: ${event.coordinates.zone} • 좌표: (${event.coordinates.x.toFixed(1)}%, ${event.coordinates.y.toFixed(1)}%)`}
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      <EventInputDialog
        open={Boolean(selectedEventType && fieldClick && menuAnchor)}
        eventType={selectedEventType}
        clickData={fieldClick}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        currentPeriod={currentPeriod}
        currentMinute={currentMinute}
        matchId={matchId}
        onClose={() => {
          setSelectedEventType(null);
          setMenuAnchor(null);
        }}
        onSubmit={handleEventSubmit}
      />

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={5000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="warning" onClose={() => setSnackbar(null)} sx={{ width: '100%' }}>
          {snackbar}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MatchRecordPage;
