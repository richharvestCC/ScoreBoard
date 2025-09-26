import React from 'react';
import { Box, Button, IconButton } from '@mui/material';
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
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { getAllowedEventsForZone, EventTypeDefinition, getEventDefinition } from './FieldZoneRules';

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
    goal: <SportsSoccerIcon fontSize="small" />,
    assist: <SportsSoccerIcon fontSize="small" />,
    keypass: <DirectionsRunIcon fontSize="small" />,
    offside: <FlagIcon fontSize="small" />,
    foul: <WarningAmberIcon fontSize="small" />,
    violation: <WarningAmberIcon fontSize="small" />,
    freekick: <SportsSoccerIcon fontSize="small" />,
    goal_line_out: <StraightenIcon fontSize="small" />,
    corner_kick: <CallMadeIcon fontSize="small" />,
    touch_line_out: <StraightenIcon fontSize="small" />,
    throw_in: <PlayArrowIcon fontSize="small" />,
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

  // 그리드 기반 팝업 위치 계산 (컨테이너 경계 내 유지)
  const calculateGridPosition = (clickX: number, clickY: number, zoneId?: string) => {
    if (!zoneId) return { x: clickX, y: clickY, transform: 'translate(-50%, -50%)' };

    // 구역 ID에서 열과 행 정보 추출 (예: A1 -> col=0, row=0)
    const col = zoneId.charCodeAt(0) - 65; // A=0, B=1, ..., M=12
    const row = parseInt(zoneId.slice(1)) - 1; // 1=0, 2=1, ..., 9=8

    // 13x9 그리드에서 각 격자의 크기 (백분율)
    const gridWidth = 100 / 13; // 약 7.69%
    const gridHeight = 100 / 9; // 약 11.11%

    // 각 격자의 시작점 계산
    const gridStartX = col * gridWidth;
    const gridStartY = row * gridHeight;

    // 팝업 예상 크기 (백분율 기준) - 컨테이너 대비
    const popupWidthPercent = 12; // 팝업 너비
    const popupHeightPercent = 20; // 팝업 높이

    // 컨테이너 경계 마진 (백분율)
    const margin = 2;

    let finalX, finalY, finalTransform;

    // M열(12번째 열)은 오른쪽 정렬
    if (col === 12) {
      const gridEndX = (col + 1) * gridWidth;
      finalX = gridEndX - margin;
      finalY = gridStartY;
      finalTransform = 'translate(-100%, 0%)';

      // 왼쪽 경계 체크
      if (finalX - popupWidthPercent < margin) {
        finalX = popupWidthPercent + margin;
        finalTransform = 'translate(-100%, 0%)';
      }
    } else {
      // 나머지 열들은 왼쪽 정렬
      finalX = Math.max(margin, gridStartX);
      finalY = gridStartY;
      finalTransform = 'translate(0%, 0%)';

      // 오른쪽 경계 체크 (컨테이너 내부 유지)
      if (finalX + popupWidthPercent > 100 - margin) {
        finalX = 100 - popupWidthPercent - margin;
      }
    }

    // 아래쪽 경계 체크 (컨테이너 내부 유지)
    if (gridStartY + popupHeightPercent > 100 - margin) {
      finalY = 100 - popupHeightPercent - margin;
    } else {
      finalY = Math.max(margin, gridStartY);
    }

    // 최종 경계 확인 (컨테이너 완전 내부 유지)
    return {
      x: Math.max(margin, Math.min(100 - margin, finalX)),
      y: Math.max(margin, Math.min(100 - margin, finalY)),
      transform: finalTransform
    };
  };

  const gridPosition = calculateGridPosition(anchor.x, anchor.y, zoneId);

  console.log('📍 Grid-based position:', {
    zoneId,
    original: { x: anchor.x, y: anchor.y },
    gridPosition
  });

  return (
    <Box
      sx={{
        position: 'absolute',
        left: `${gridPosition.x}%`,
        top: `${gridPosition.y}%`,
        transform: gridPosition.transform || 'translate(0%, 0%)',
        pointerEvents: 'auto',
        zIndex: 10,
      }}
      onClick={(event) => event.stopPropagation()}
    >
      <Box
        sx={{
          position: 'relative',
          backgroundColor: '#ffffff',
          borderColor: 'primary.200',
          border: '1px solid',
          borderRadius: 2,
          padding: '6px',
          boxShadow: 1,
          display: 'flex',
          flexDirection: 'row',
          gap: '8px',
          alignItems: 'flex-start',
          minWidth: 'fit-content',
        }}
      >
        <Box>
          {buttons.map((eventType, index) => {
            const positiveEvents = ['goal', 'assist', 'keypass', 'freekick', 'corner_kick'];
            const isPositive = positiveEvents.includes(eventType.id);
            const nextEventType = buttons[index + 1];
            const nextIsPositive = nextEventType ? positiveEvents.includes(nextEventType.id) : false;
            const showDivider = isPositive && nextEventType && !nextIsPositive;

            return (
              <Box key={eventType.id}>
                <Button
                  variant="text"
                  onClick={() => onSelect(eventType)}
                  sx={{
                    backgroundColor: 'transparent',
                    color: '#333',
                    cursor: 'pointer',
                    transition: 'none',
                    padding: '6px 12px',
                    width: '100%',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '8px',
                    whiteSpace: 'nowrap',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.04)',
                    },
                  }}
                >
                  {eventType.icon}
                  {eventType.name}
                </Button>
                {showDivider && (
                  <Box
                    sx={{
                      height: '1px',
                      backgroundColor: 'primary.200',
                      margin: '4px 0',
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Box>

        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}>
          <IconButton
            size="small"
            sx={{
              width: 32,
              height: 32,
              color: '#666666',
              cursor: 'pointer',
              '&:hover': {
                color: '#333333',
              },
            }}
            onClick={onClose}
          >
            <CloseIcon fontSize="medium" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default RadialEventMenu;