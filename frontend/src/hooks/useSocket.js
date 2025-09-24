import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../stores/authStore';

const useSocket = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      // 인증되지 않은 경우 소켓 연결 해제
      if (socket) {
        // 메모리 누수 방지를 위해 모든 이벤트 리스너 제거
        socket.removeAllListeners();
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // 기존 소켓이 있다면 정리
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
    }

    // Socket.IO 클라이언트 생성
    const newSocket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001', {
      auth: {
        token: accessToken
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });

    // 연결 성공
    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setIsConnected(true);
      setConnectionError(null);
      reconnectAttemptsRef.current = 0;
    });

    // 연결 해제
    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);

      if (reason === 'io server disconnect') {
        // 서버에서 강제로 연결을 끊은 경우 (인증 실패 등)
        setConnectionError('서버에서 연결을 거부했습니다. 다시 로그인해주세요.');
      }
    });

    // 연결 오류
    newSocket.on('connect_error', (error) => {
      console.error('🔥 Socket connection error:', error.message);
      reconnectAttemptsRef.current += 1;

      if (error.message.includes('Authentication') || error.message.includes('token')) {
        setConnectionError('인증에 실패했습니다. 다시 로그인해주세요.');
      } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        setConnectionError('서버에 연결할 수 없습니다. 나중에 다시 시도해주세요.');
      } else {
        setConnectionError(`연결 시도 중... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
      }
    });

    // 재연결 시도
    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      setConnectionError(null);
    });

    // 재연결 실패
    newSocket.on('reconnect_failed', () => {
      console.error('💥 Socket reconnection failed');
      setConnectionError('서버 연결에 실패했습니다. 페이지를 새로고침해주세요.');
    });

    // 서버 에러
    newSocket.on('error', (error) => {
      console.error('🚨 Socket server error:', error);
      setConnectionError(error.message || '서버 오류가 발생했습니다.');
    });

    setSocket(newSocket);

    // 클린업 - 메모리 누수 방지
    return () => {
      if (newSocket) {
        newSocket.removeAllListeners();
        newSocket.disconnect();
      }
    };
  }, [isAuthenticated, accessToken, socket]);

  // 경기 참여
  const joinMatch = (matchId) => {
    if (socket && isConnected) {
      socket.emit('join-match', { matchId });
    }
  };

  // 경기 떠나기
  const leaveMatch = (matchId) => {
    if (socket && isConnected) {
      socket.emit('leave-match', { matchId });
    }
  };

  // 스코어 업데이트 (관리자용)
  const updateScore = (matchId, homeScore, awayScore, minute) => {
    if (socket && isConnected) {
      socket.emit('score-update', {
        matchId,
        homeScore,
        awayScore,
        minute
      });
    }
  };

  // 경기 이벤트 추가 (관리자용)
  const addMatchEvent = (matchId, eventType, eventData) => {
    if (socket && isConnected) {
      socket.emit('match-event', {
        matchId,
        eventType,
        eventData
      });
    }
  };

  // 경기 상태 변경 (관리자용)
  const changeMatchStatus = (matchId, status) => {
    if (socket && isConnected) {
      socket.emit('match-status-change', {
        matchId,
        status
      });
    }
  };

  // 경기 데이터 요청
  const requestMatchData = (matchId) => {
    if (socket && isConnected) {
      socket.emit('request-match-data', { matchId });
    }
  };

  // 수동 재연결
  const reconnect = () => {
    if (socket) {
      setConnectionError('연결 시도 중...');
      reconnectAttemptsRef.current = 0;
      socket.connect();
    }
  };

  return {
    socket,
    isConnected,
    connectionError,
    joinMatch,
    leaveMatch,
    updateScore,
    addMatchEvent,
    changeMatchStatus,
    requestMatchData,
    reconnect
  };
};

export default useSocket;