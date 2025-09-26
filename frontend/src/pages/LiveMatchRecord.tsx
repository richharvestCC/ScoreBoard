import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Snackbar
} from '@mui/material';
import {
  Fullscreen,
  FullscreenExit,
  PlayArrow,
  Pause,
  Timer,
  ArrowBack,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import InteractiveField, { FieldClick } from '../components/matches/InteractiveField';
import RadialEventMenu, { EventType } from '../components/matches/RadialEventMenu';
import EventInputDialog from '../components/matches/EventInputDialog';
import type { MatchEvent, Team } from '../types/match';
import { createEvent, CreateEventPayload } from '../services/events';

const createDemoTeam = (prefix: 'HOME' | 'AWAY', color: string, name: string): Team => ({
  id: prefix.toLowerCase(),
  name,
  shortName: prefix,
  color,
  players: Array.from({ length: 7 }).map((_, index) => ({
    id: `${prefix}-${index + 1}`,
    name: `${index + 2}번 선수`,
    number: index + 2,
    position: index < 2 ? 'DF' : index < 4 ? 'MF' : 'FW',
    isActive: true,
  })),
});

const LiveMatchRecord: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  // URL에서 경기 정보 파싱
  const searchParams = new URLSearchParams(location.search);

  // 브라우저 크기 상태 관리
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // 로그 패널 접기/펼치기 상태
  const [isLogCollapsed, setIsLogCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 컨테이너와 경기장 크기 계산
  const containerDimensions = useMemo(() => {
    // 컨테이너 최대/최소 폭 제한
    const containerWidth = Math.max(1024, Math.min(1600, windowSize.width * 0.95));
    const availableHeight = windowSize.height - 140; // 헤더 + 패딩 제외

    // 로그 패널 크기
    const logPanelWidth = isLogCollapsed ? 40 : 350; // 접혔을 때는 버튼만
    const gap = 20; // 경기장과 로그 패널 사이 간격

    // 경기장 영역 폭 계산
    const fieldAreaWidth = containerWidth - logPanelWidth - gap;

    const aspectRatio = 19 / 12; // 축구장 비율

    let fieldWidth, fieldHeight;

    // 사용 가능한 높이를 기준으로 경기장 크기 결정
    const maxFieldHeight = availableHeight;
    const fieldHeightByContainer = maxFieldHeight;
    const fieldWidthByHeight = fieldHeightByContainer * aspectRatio;

    // 폭 제한에 맞는지 확인
    if (fieldWidthByHeight <= fieldAreaWidth) {
      fieldHeight = fieldHeightByContainer;
      fieldWidth = fieldWidthByHeight;
    } else {
      // 폭에 맞춰서 높이 조정
      fieldWidth = fieldAreaWidth;
      fieldHeight = fieldWidth / aspectRatio;
    }

    return {
      containerWidth,
      fieldWidth: Math.round(fieldWidth),
      fieldHeight: Math.round(fieldHeight),
      logPanelWidth
    };
  }, [windowSize, isLogCollapsed]);
  const homeTeamName = searchParams.get('homeTeam') || '서울 FC';
  const awayTeamName = searchParams.get('awayTeam') || '부산 아이파크';
  const venue = searchParams.get('venue') || '서울월드컵경기장';

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [currentPeriod, setCurrentPeriod] = useState(1);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);

  // Interactive field states
  const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number } | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
  const [fieldClick, setFieldClick] = useState<FieldClick | null>(null);

  // 득점 워크플로우 상태
  const [waitingForGoalWorkflow, setWaitingForGoalWorkflow] = useState<'assist' | 'keypass' | null>(null);

  const homeTeam = createDemoTeam('HOME', '#1976d2', homeTeamName);
  const awayTeam = createDemoTeam('AWAY', '#d32f2f', awayTeamName);
  const matchId = params.matchId || 'live-match-001';

  // localStorage 키들 (useMemo로 최적화)
  const STORAGE_KEYS = useMemo(() => ({
    isGameRunning: `match-${matchId}-running`,
    gameStartTime: `match-${matchId}-start-time`,
    currentPeriod: `match-${matchId}-period`,
    events: `match-${matchId}-events`,
  }), [matchId]);

  // 컴포넌트 초기화 시 localStorage에서 상태 복원
  useEffect(() => {
    const savedRunning = localStorage.getItem(STORAGE_KEYS.isGameRunning);
    const savedStartTime = localStorage.getItem(STORAGE_KEYS.gameStartTime);
    const savedPeriod = localStorage.getItem(STORAGE_KEYS.currentPeriod);
    const savedEvents = localStorage.getItem(STORAGE_KEYS.events);

    if (savedRunning === 'true') {
      setIsGameRunning(true);
    }
    if (savedStartTime) {
      const startTime = parseInt(savedStartTime);
      setGameStartTime(startTime);

      // 현재까지 경과된 시간 계산 (분 단위)
      const elapsedMinutes = (Date.now() - startTime) / (1000 * 60);
      setCurrentMinute(elapsedMinutes);
    }
    if (savedPeriod) {
      setCurrentPeriod(parseInt(savedPeriod));
    }
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents);
        setEvents(parsedEvents);
      } catch (error) {
        console.error('Failed to parse saved events:', error);
      }
    }
  }, [matchId, STORAGE_KEYS]);

  // Timer effect - 1초마다 업데이트 (실제 시간 기준)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGameRunning && gameStartTime) {
      interval = setInterval(() => {
        const elapsedMinutes = (Date.now() - gameStartTime) / (1000 * 60);
        setCurrentMinute(elapsedMinutes);
      }, 1000); // 1초마다 실제 경과시간 재계산
    }
    return () => clearInterval(interval);
  }, [isGameRunning, gameStartTime]);

  const mutation = useMutation({
    mutationFn: (payload: CreateEventPayload) => createEvent(payload),
    onError: () => {
      setSnackbar('이벤트 저장 실패. 인터넷 연결을 확인해주세요.');
    },
  });

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleGameControl = useCallback(() => {
    setIsGameRunning(prev => {
      const newRunning = !prev;

      if (newRunning && !gameStartTime) {
        // 경기 시작
        const startTime = Date.now();
        setGameStartTime(startTime);
        localStorage.setItem(STORAGE_KEYS.gameStartTime, startTime.toString());
      }

      // 경기 상태 저장
      localStorage.setItem(STORAGE_KEYS.isGameRunning, newRunning.toString());

      return newRunning;
    });
  }, [gameStartTime, STORAGE_KEYS]);

  const handleBack = useCallback(() => {
    navigate('/admin/match-record');
  }, [navigate]);

  const handleFieldClick = useCallback((click: FieldClick) => {
    if (!isGameRunning) {
      setSnackbar('경기가 시작되지 않았습니다. 경기를 시작해주세요.');
      return;
    }

    // 워크플로우 모드인 경우 좌표만 업데이트
    if (waitingForGoalWorkflow) {
      setFieldClick(click);
      return;
    }

    // 일반 모드
    setFieldClick(click);
    setMenuAnchor({ x: click.x, y: click.y });
    setSelectedEventType(null);
  }, [isGameRunning, waitingForGoalWorkflow]);

  const handleEventTypeSelect = useCallback((event: EventType) => {
    setSelectedEventType(event);
  }, []);

  // 워크플로우 핸들러들
  const handleRequestCoordinate = useCallback((type: 'assist' | 'keypass') => {
    setWaitingForGoalWorkflow(type);
    setMenuAnchor(null); // 메뉴 숨기기
  }, []);

  const handleCoordinateSelected = useCallback((coordinate: {x: number, y: number, zone: string}) => {
    setWaitingForGoalWorkflow(null);
    // 좌표 선택 완료는 EventInputDialog에서 처리됨
  }, []);

  const handleEventSubmit = useCallback(async (event: MatchEvent) => {
    const updatedEvents = [event, ...events];
    setEvents(updatedEvents);

    // 이벤트를 localStorage에 저장
    localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(updatedEvents));

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

    try {
      await mutation.mutateAsync(payload);
    } catch (error) {
      console.error('Event save error:', error);
    }

    // Reset states
    setSelectedEventType(null);
    setMenuAnchor(null);
    setFieldClick(null);
  }, [events, mutation, STORAGE_KEYS]);

  const formatTime = useCallback((minutes: number) => {
    const totalMinutes = Math.floor(minutes);
    const seconds = Math.floor((minutes % 1) * 60);
    return `${totalMinutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* 헤더 바 */}
      <Box sx={{
        backgroundColor: 'background.paper',
        color: 'text.primary',
        px: 3,
        py: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={handleBack} color="inherit">
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {homeTeamName} vs {awayTeamName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              📍 {venue}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* 경기 시간 표시 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Timer color="action" />
            <Typography variant="h6" fontWeight={600}>
              {currentPeriod}P {formatTime(currentMinute)}'
            </Typography>
            <Chip
              label={isGameRunning ? '진행중' : '일시정지'}
              color={isGameRunning ? 'success' : 'warning'}
              size="small"
            />
          </Box>

          {/* 경기 컨트롤 */}
          <Button
            variant={isGameRunning ? 'outlined' : 'contained'}
            startIcon={isGameRunning ? <Pause /> : <PlayArrow />}
            onClick={handleGameControl}
            sx={{ minWidth: 120 }}
          >
            {isGameRunning ? '일시정지' : '시작'}
          </Button>

          {/* 전체화면 토글 */}
          <IconButton onClick={handleFullscreen} color="inherit">
            {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
        </Box>
      </Box>

      {/* 메인 컨테이너 */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '20px',
        overflow: 'hidden'
      }}>
        <Box sx={{
          width: '100%',
          maxWidth: '1600px',
          minWidth: '1024px',
          height: `${containerDimensions.fieldHeight}px`,
          display: 'flex',
          flexDirection: 'row',
          gap: '20px'
        }}>
          {/* 경기장 영역 */}
          <Box sx={{
            width: `${containerDimensions.fieldWidth}px`,
            height: `${containerDimensions.fieldHeight}px`,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <InteractiveField
              onZoneClick={handleFieldClick}
              variant="soccer"
            />

            {/* 팝업 메뉴들 - InteractiveField와 같은 컨테이너 내부 */}
            {Boolean(menuAnchor) && !selectedEventType && (
              <RadialEventMenu
                open={Boolean(menuAnchor) && !selectedEventType}
                anchor={menuAnchor}
                onSelect={handleEventTypeSelect}
                onClose={() => setMenuAnchor(null)}
                zoneId={fieldClick?.zone?.id}
                currentHalf={currentPeriod}
                matchEvents={events}
              />
            )}
          </Box>

          {/* 로그 패널 (접을 수 있음) */}
          {!isLogCollapsed && (
            <Box sx={{
              width: `${containerDimensions.logPanelWidth}px`,
              height: `${containerDimensions.fieldHeight}px`,
              backgroundColor: 'background.paper',
              borderRadius: '8px',
              border: 1,
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {/* 로그 헤더 */}
              <Box sx={{
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    경기 이벤트 로그
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    총 {events.length}개 이벤트
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => setIsLogCollapsed(true)}
                  sx={{ color: 'text.secondary' }}
                >
                  <ChevronRight />
                </IconButton>
              </Box>

              {/* 로그 콘텐츠 */}
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {events.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Alert severity="info" variant="outlined">
                      아직 기록된 이벤트가 없습니다.
                      <br />경기장을 클릭해 첫 이벤트를 기록해보세요.
                    </Alert>
                  </Box>
                ) : (
                  <List sx={{ p: 0 }}>
                    {events.map((event, index) => (
                      <React.Fragment key={event.id}>
                        <ListItem
                          alignItems="flex-start"
                          sx={{
                            py: 1.5,
                            px: 2,
                            backgroundColor: index === 0 ? 'action.hover' : 'transparent'
                          }}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Chip
                                  label={`${event.minute}'`}
                                  size="small"
                                  color="primary"
                                  variant="filled"
                                />
                                <Typography variant="subtitle2" fontWeight={600}>
                                  {event.eventType}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  팀: {event.teamId} • 선수: {event.playerId}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  구역: {event.coordinates.zone} • 좌표: ({event.coordinates.x.toFixed(1)}%, {event.coordinates.y.toFixed(1)}%)
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < events.length - 1 && <Divider component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Box>
            </Box>
          )}

          {/* 로그 패널 접혔을 때 펼치기 버튼 */}
          {isLogCollapsed && (
            <Box sx={{
              width: '40px',
              height: `${containerDimensions.fieldHeight}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IconButton
                onClick={() => setIsLogCollapsed(false)}
                sx={{
                  backgroundColor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <ChevronLeft />
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>

      {/* 이벤트 입력 다이얼로그 */}
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
          setFieldClick(null);
        }}
        onSubmit={handleEventSubmit}
        onRequestCoordinate={handleRequestCoordinate}
        onCoordinateSelected={handleCoordinateSelected}
      />

      {/* 스낵바 */}
      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={4000}
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

export default LiveMatchRecord;