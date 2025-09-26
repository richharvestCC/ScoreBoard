import React from 'react';
import { Box, Button, Paper } from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DangerousIcon from '@mui/icons-material/Dangerous';
import HealingIcon from '@mui/icons-material/Healing';
import SyncIcon from '@mui/icons-material/Sync';
import AssistWalkerIcon from '@mui/icons-material/AssistWalker';
import FlagIcon from '@mui/icons-material/Flag';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import CallMadeIcon from '@mui/icons-material/CallMade';
import StraightenIcon from '@mui/icons-material/Straighten';
import { getAllowedEventsForZone, EventTypeDefinition, getEventDefinition, EventDefinition } from './FieldZoneRules';

export interface EventType {
  id: string;
  name: string;
  color: string;
  icon: React.ReactNode;
}

export interface RadialEventMenuProps {
  open: boolean;
  anchor: { x: number; y: number } | null; // percentage based within container
  onSelect: (event: EventType) => void;
  onClose: () => void;
  events?: EventType[];
  zoneId?: string; // 현재 클릭된 구역 ID
  currentHalf?: number; // 현재 하프 (1 또는 2)
  matchEvents?: Array<{ eventType: string; [key: string]: any }>; // 현재 경기의 모든 이벤트
}

// 이벤트 ID를 Material-UI 아이콘으로 매핑
const getIconForEventType = (eventId: string): React.ReactNode => {
  const iconMap: { [key: string]: React.ReactNode } = {
    goal: <EmojiEventsIcon fontSize="small" />,
    assist: <SportsSoccerIcon fontSize="small" />,
    keypass: <DirectionsRunIcon fontSize="small" />,
    offside: <FlagIcon fontSize="small" />,
    foul: <AssistWalkerIcon fontSize="small" />,
    violation: <WarningAmberIcon fontSize="small" />,
    freekick: <SportsSoccerIcon fontSize="small" />,
    goal_line_out: <StraightenIcon fontSize="small" />,
    corner_kick: <CallMadeIcon fontSize="small" />,
    touch_line_out: <StraightenIcon fontSize="small" />,
    substitution: <SyncIcon fontSize="small" />
  };
  return iconMap[eventId] || <SportsSoccerIcon fontSize="small" />;
};

// EventTypeDefinition을 EventType으로 변환
const convertToEventType = (eventDef: EventTypeDefinition): EventType => ({
  id: eventDef.id,
  name: eventDef.name,
  color: eventDef.color,
  icon: getIconForEventType(eventDef.id)
});

const DEFAULT_EVENTS: EventType[] = [
  { id: 'goal', name: '득점', color: '#f44336', icon: <EmojiEventsIcon fontSize="small" /> },
  { id: 'shot', name: '슈팅', color: '#1976d2', icon: <SportsSoccerIcon fontSize="small" /> },
  { id: 'foul', name: '파울', color: '#8d6e63', icon: <AssistWalkerIcon fontSize="small" /> },
  { id: 'yellow', name: '경고', color: '#ffb300', icon: <WarningAmberIcon fontSize="small" /> },
  { id: 'red', name: '퇴장', color: '#d32f2f', icon: <DangerousIcon fontSize="small" /> },
  { id: 'injury', name: '부상', color: '#ab47bc', icon: <HealingIcon fontSize="small" /> },
  { id: 'substitution', name: '교체', color: '#26a69a', icon: <SyncIcon fontSize="small" /> },
];

// 이벤트 전제조건 확인 함수
const checkEventPrerequisites = (eventId: string, matchEvents: Array<{ eventType: string; [key: string]: any }> = []): boolean => {
  const eventDef = getEventDefinition(eventId);
  if (!eventDef || !eventDef.requiresPrevious) {
    return true; // 전제조건이 없으면 허용
  }

  const requiredEvents = eventDef.requiresPrevious;
  const recordedEventTypes = matchEvents.map(event => event.eventType);

  // 모든 전제조건 이벤트가 기록되었는지 확인
  const hasAllPrerequisites = requiredEvents.every((required: string) =>
    recordedEventTypes.includes(required)
  );

  console.log(`📋 Event ${eventId} prerequisites check:`, {
    required: requiredEvents,
    recorded: recordedEventTypes,
    hasAll: hasAllPrerequisites
  });

  return hasAllPrerequisites;
};

export const RadialEventMenu: React.FC<RadialEventMenuProps> = ({
  open,
  anchor,
  onSelect,
  onClose,
  events = DEFAULT_EVENTS,
  zoneId,
  currentHalf = 1,
  matchEvents = [],
}) => {
  if (!open || !anchor) return null;

  // 구역별 허용 이벤트 계산
  let buttons: EventType[] = [];

  console.log('📍 RadialEventMenu - zoneId:', zoneId); // 디버깅용

  if (zoneId) {
    // 구역별 규칙에 따른 허용 이벤트 가져오기
    const allowedEvents = getAllowedEventsForZone(zoneId);
    console.log(`🎯 Zone ${zoneId} allowed events:`, allowedEvents.map(e => `${e.id}(${e.name})`)); // 디버깅용

    // 전제조건 확인하여 이벤트 필터링
    const filteredEvents = allowedEvents.filter(event =>
      checkEventPrerequisites(event.id, matchEvents)
    );
    console.log(`✅ Events after prerequisite check:`, filteredEvents.map(e => `${e.id}(${e.name})`)); // 디버깅용

    buttons = filteredEvents.map(convertToEventType);

    if (buttons.length === 0) {
      console.log('⚠️ No events found for zone after filtering, using defaults'); // 디버깅용
    }
  }

  // 구역이 없거나 이벤트가 없으면 기본 이벤트 사용 (전제조건 필터링 적용)
  if (!zoneId || buttons.length === 0) {
    console.log('🔄 Using default events for zone:', zoneId); // 디버깅용
    const defaultEvents = events || DEFAULT_EVENTS;
    const filteredDefaults = defaultEvents.filter(event =>
      checkEventPrerequisites(event.id, matchEvents)
    );
    buttons = filteredDefaults;
  }

  console.log('🎪 Final buttons after all filters:', buttons.map(b => `${b.id}(${b.name})`)); // 디버깅용
  const angleStep = buttons.length ? (Math.PI * 2) / buttons.length : 0;

  return (
    <Box
      sx={{
        position: 'absolute',
        // InteractiveField는 aspectRatio 19:12로 중앙 정렬됨
        // 컨테이너 내에서 실제 경기장 영역의 좌표로 변환
        left: `calc(50% + ${(anchor.x - 50) * 0.8}%)`, // 경기장 영역 내 좌표 조정
        top: `calc(50% + ${(anchor.y - 50) * 0.8}%)`,  // 경기장 영역 내 좌표 조정
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'auto',
        zIndex: 10,
      }}
      onClick={(event) => event.stopPropagation()}
    >
      <Paper
        elevation={6}
        sx={{
          position: 'relative',
          width: 160,
          height: 160,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible',
        }}
      >
        <Button
          size="small"
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: (theme) => theme.palette.grey[100],
            color: 'text.secondary',
          }}
          onClick={onClose}
        >
          닫기
        </Button>
        {buttons.map((eventType, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const radius = 60;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <Button
              key={eventType.id}
              size="small"
              variant="contained"
              onClick={() => onSelect(eventType)}
              sx={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                borderRadius: 999,
                backgroundColor: eventType.color,
                '&:hover': {
                  backgroundColor: eventType.color,
                  opacity: 0.85,
                },
                boxShadow: 2,
              }}
            >
              {eventType.name}
            </Button>
          );
        })}
      </Paper>
    </Box>
  );
};

export default RadialEventMenu;
