import React, { useEffect, useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { EventInputDialog } from '../components/matches/EventInputDialog';

interface EventInputPageProps {
  // URL parameters will be passed via query string
}

interface WindowData {
  eventType: { id: string; name: string; color: string };
  clickData: { x: number; y: number; zone: { id: string; name: string } };
  homeTeam: any;
  awayTeam: any;
  currentPeriod: number;
  currentMinute: number;
  matchId: string;
}

const EventInputPage: React.FC<EventInputPageProps> = () => {
  const [windowData, setWindowData] = useState<WindowData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // URL에서 데이터 파싱 또는 부모 창으로부터 데이터 받기
    // const urlParams = new URLSearchParams(window.location.search);

    // 부모 창으로부터 데이터 받기 (postMessage 이용)
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'EVENT_INPUT_DATA') {
        setWindowData(event.data.payload);
        setLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);

    // 부모 창에게 데이터 요청
    if (window.opener) {
      window.opener.postMessage({ type: 'REQUEST_EVENT_DATA' }, '*');
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleEventSubmit = (eventData: any) => {
    // 부모 창에게 이벤트 데이터 전송
    if (window.opener) {
      window.opener.postMessage({
        type: 'EVENT_SUBMITTED',
        payload: eventData
      }, '*');
    }

    // 창 닫기
    window.close();
  };

  const handleClose = () => {
    // 부모 창에게 취소 알림
    if (window.opener) {
      window.opener.postMessage({ type: 'EVENT_CANCELLED' }, '*');
    }
    window.close();
  };

  if (loading || !windowData) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>로딩 중...</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: 'background.default',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <EventInputDialog
        open={true}
        eventType={windowData.eventType}
        clickData={windowData.clickData}
        homeTeam={windowData.homeTeam}
        awayTeam={windowData.awayTeam}
        currentPeriod={windowData.currentPeriod}
        currentMinute={windowData.currentMinute}
        matchId={windowData.matchId}
        onClose={handleClose}
        onSubmit={handleEventSubmit}
      />
    </Box>
  );
};

export default EventInputPage;