const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { Match, Club, User, MatchEvent } = require('../models');

class LiveSocketService {
  constructor() {
    this.io = null;
    this.liveMatches = new Map(); // matchId -> { users, status, lastUpdate }
    this.userSessions = new Map(); // userId -> Set of socketIds
    this.socketToUser = new Map(); // socketId -> userId
    this.roomManagers = new Map(); // matchId -> Set of managerUserIds
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // 인증 미들웨어
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user.id;
        socket.userRole = user.role;
        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Invalid authentication token'));
      }
    });

    this.setupEventHandlers();
    console.log('🔌 Live Socket Service initialized');
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`👤 User ${socket.userId} connected: ${socket.id}`);

      // 사용자 세션 관리
      this.addUserSession(socket.userId, socket.id);

      // 이벤트 핸들러 등록
      socket.on('join-match', (data) => this.handleJoinMatch(socket, data));
      socket.on('leave-match', (data) => this.handleLeaveMatch(socket, data));
      socket.on('match-event', (data) => this.handleMatchEvent(socket, data));
      socket.on('score-update', (data) => this.handleScoreUpdate(socket, data));
      socket.on('match-status-change', (data) => this.handleMatchStatusChange(socket, data));
      socket.on('request-match-data', (data) => this.handleRequestMatchData(socket, data));

      socket.on('disconnect', () => {
        console.log(`👤 User ${socket.userId} disconnected: ${socket.id}`);
        this.removeUserSession(socket.userId, socket.id);
        this.leaveAllMatches(socket);
      });

      socket.on('error', (error) => {
        console.error(`Socket error for user ${socket.userId}:`, error);
      });
    });
  }

  // 사용자 세션 관리
  addUserSession(userId, socketId) {
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, new Set());
    }
    this.userSessions.get(userId).add(socketId);
    this.socketToUser.set(socketId, userId);
  }

  removeUserSession(userId, socketId) {
    if (this.userSessions.has(userId)) {
      this.userSessions.get(userId).delete(socketId);
      if (this.userSessions.get(userId).size === 0) {
        this.userSessions.delete(userId);
      }
    }
    this.socketToUser.delete(socketId);
  }

  // 경기 참여 처리
  async handleJoinMatch(socket, data) {
    try {
      const { matchId } = data;

      if (!matchId) {
        socket.emit('error', { message: 'Match ID is required' });
        return;
      }

      // 경기 존재 확인
      const match = await Match.findByPk(matchId, {
        include: [
          { model: Club, as: 'homeClub' },
          { model: Club, as: 'awayClub' }
        ]
      });

      if (!match) {
        socket.emit('error', { message: 'Match not found' });
        return;
      }

      // 관리자 권한 확인 (스코어 업데이트용)
      const canManage = ['admin', 'moderator', 'organizer'].includes(socket.userRole) ||
                       match.created_by === socket.userId;

      // 경기 룸 참여
      socket.join(`match:${matchId}`);

      // 라이브 경기 정보 초기화
      if (!this.liveMatches.has(matchId)) {
        this.liveMatches.set(matchId, {
          users: new Set(),
          managers: new Set(),
          status: match.status,
          lastUpdate: new Date(),
          matchData: match
        });
      }

      const liveMatch = this.liveMatches.get(matchId);
      liveMatch.users.add(socket.userId);

      if (canManage) {
        liveMatch.managers.add(socket.userId);
        if (!this.roomManagers.has(matchId)) {
          this.roomManagers.set(matchId, new Set());
        }
        this.roomManagers.get(matchId).add(socket.userId);
      }

      // 현재 경기 데이터 전송
      socket.emit('match-joined', {
        matchId,
        match: match,
        canManage,
        viewerCount: liveMatch.users.size,
        lastUpdate: liveMatch.lastUpdate
      });

      // 다른 사용자들에게 새 시청자 알림
      socket.to(`match:${matchId}`).emit('viewer-joined', {
        userId: socket.userId,
        userName: socket.user.name,
        viewerCount: liveMatch.users.size
      });

      console.log(`👤 User ${socket.userId} joined match ${matchId} (manage: ${canManage})`);

    } catch (error) {
      console.error('Join match error:', error);
      socket.emit('error', { message: 'Failed to join match' });
    }
  }

  // 경기 떠나기 처리
  handleLeaveMatch(socket, data) {
    try {
      const { matchId } = data;

      if (!matchId) return;

      socket.leave(`match:${matchId}`);

      if (this.liveMatches.has(matchId)) {
        const liveMatch = this.liveMatches.get(matchId);
        liveMatch.users.delete(socket.userId);
        liveMatch.managers.delete(socket.userId);

        if (this.roomManagers.has(matchId)) {
          this.roomManagers.get(matchId).delete(socket.userId);
        }

        // 시청자 수 업데이트
        socket.to(`match:${matchId}`).emit('viewer-left', {
          userId: socket.userId,
          viewerCount: liveMatch.users.size
        });

        // 경기에 아무도 없으면 정리
        if (liveMatch.users.size === 0) {
          this.liveMatches.delete(matchId);
          this.roomManagers.delete(matchId);
        }
      }

      console.log(`👤 User ${socket.userId} left match ${matchId}`);

    } catch (error) {
      console.error('Leave match error:', error);
    }
  }

  // 모든 경기에서 떠나기
  leaveAllMatches(socket) {
    for (const [matchId, liveMatch] of this.liveMatches.entries()) {
      if (liveMatch.users.has(socket.userId)) {
        this.handleLeaveMatch(socket, { matchId });
      }
    }
  }

  // 경기 이벤트 처리
  async handleMatchEvent(socket, data) {
    try {
      const { matchId, eventType, eventData } = data;

      // 관리자 권한 확인
      if (!this.canManageMatch(socket.userId, matchId)) {
        socket.emit('error', { message: 'Insufficient permissions to add match events' });
        return;
      }

      // 경기 이벤트 생성
      const matchEvent = await MatchEvent.create({
        match_id: matchId,
        event_type: eventType,
        minute: eventData.minute,
        player_id: eventData.playerId,
        club_id: eventData.clubId,
        description: eventData.description,
        created_by: socket.userId
      });

      // 모든 시청자에게 이벤트 브로드캐스트
      this.io.to(`match:${matchId}`).emit('match-event-added', {
        matchId,
        event: matchEvent,
        timestamp: new Date()
      });

      console.log(`⚽ Match event added to ${matchId}: ${eventType} by ${socket.userId}`);

    } catch (error) {
      console.error('Match event error:', error);
      socket.emit('error', { message: 'Failed to add match event' });
    }
  }

  // 점수 업데이트 처리
  async handleScoreUpdate(socket, data) {
    try {
      const { matchId, homeScore, awayScore } = data;

      // 관리자 권한 확인
      if (!this.canManageMatch(socket.userId, matchId)) {
        socket.emit('error', { message: 'Insufficient permissions to update score' });
        return;
      }

      // 점수 유효성 검사
      if (typeof homeScore !== 'number' || typeof awayScore !== 'number' ||
          homeScore < 0 || awayScore < 0) {
        socket.emit('error', { message: 'Invalid score values' });
        return;
      }

      // DB 업데이트
      await Match.update(
        { home_score: homeScore, away_score: awayScore },
        { where: { id: matchId } }
      );

      // 라이브 매치 데이터 업데이트
      if (this.liveMatches.has(matchId)) {
        const liveMatch = this.liveMatches.get(matchId);
        liveMatch.lastUpdate = new Date();
        liveMatch.matchData.home_score = homeScore;
        liveMatch.matchData.away_score = awayScore;
      }

      // 모든 시청자에게 점수 업데이트 브로드캐스트
      this.io.to(`match:${matchId}`).emit('score-updated', {
        matchId,
        homeScore,
        awayScore,
        timestamp: new Date(),
        updatedBy: socket.user.name
      });

      console.log(`⚽ Score updated for match ${matchId}: ${homeScore}-${awayScore} by ${socket.userId}`);

    } catch (error) {
      console.error('Score update error:', error);
      socket.emit('error', { message: 'Failed to update score' });
    }
  }

  // 경기 상태 변경 처리
  async handleMatchStatusChange(socket, data) {
    try {
      const { matchId, status } = data;

      // 관리자 권한 확인
      if (!this.canManageMatch(socket.userId, matchId)) {
        socket.emit('error', { message: 'Insufficient permissions to change match status' });
        return;
      }

      // 유효한 상태 확인
      const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        socket.emit('error', { message: 'Invalid match status' });
        return;
      }

      // DB 업데이트
      await Match.update(
        { status },
        { where: { id: matchId } }
      );

      // 라이브 매치 데이터 업데이트
      if (this.liveMatches.has(matchId)) {
        const liveMatch = this.liveMatches.get(matchId);
        liveMatch.status = status;
        liveMatch.lastUpdate = new Date();
        liveMatch.matchData.status = status;
      }

      // 모든 시청자에게 상태 변경 브로드캐스트
      this.io.to(`match:${matchId}`).emit('match-status-changed', {
        matchId,
        status,
        timestamp: new Date(),
        updatedBy: socket.user.name
      });

      console.log(`⚽ Match status changed for ${matchId}: ${status} by ${socket.userId}`);

    } catch (error) {
      console.error('Match status change error:', error);
      socket.emit('error', { message: 'Failed to change match status' });
    }
  }

  // 경기 데이터 요청 처리
  async handleRequestMatchData(socket, data) {
    try {
      const { matchId } = data;

      const match = await Match.findByPk(matchId, {
        include: [
          { model: Club, as: 'homeClub' },
          { model: Club, as: 'awayClub' },
          { model: MatchEvent, as: 'events', order: [['minute', 'ASC']] }
        ]
      });

      if (!match) {
        socket.emit('error', { message: 'Match not found' });
        return;
      }

      const liveMatch = this.liveMatches.get(matchId);

      socket.emit('match-data', {
        matchId,
        match,
        viewerCount: liveMatch?.users.size || 0,
        lastUpdate: liveMatch?.lastUpdate || new Date()
      });

    } catch (error) {
      console.error('Request match data error:', error);
      socket.emit('error', { message: 'Failed to get match data' });
    }
  }

  // 권한 확인 헬퍼
  canManageMatch(userId, matchId) {
    // 관리자 권한이 있거나 해당 경기의 매니저인지 확인
    return this.roomManagers.has(matchId) && this.roomManagers.get(matchId).has(userId);
  }

  // 외부 API용 - 경기에 연결된 모든 사용자에게 브로드캐스트
  broadcastToMatch(matchId, event, data) {
    if (this.io) {
      this.io.to(`match:${matchId}`).emit(event, data);
    }
  }

  // 특정 사용자에게 메시지 전송
  sendToUser(userId, event, data) {
    if (this.userSessions.has(userId)) {
      const socketIds = this.userSessions.get(userId);
      socketIds.forEach(socketId => {
        this.io.to(socketId).emit(event, data);
      });
    }
  }

  // 라이브 경기 통계
  getLiveMatchStats() {
    const stats = {
      totalLiveMatches: this.liveMatches.size,
      totalViewers: 0,
      matchDetails: []
    };

    for (const [matchId, liveMatch] of this.liveMatches.entries()) {
      stats.totalViewers += liveMatch.users.size;
      stats.matchDetails.push({
        matchId,
        viewerCount: liveMatch.users.size,
        managerCount: liveMatch.managers.size,
        status: liveMatch.status,
        lastUpdate: liveMatch.lastUpdate
      });
    }

    return stats;
  }

  // 서비스 종료
  close() {
    if (this.io) {
      this.io.close();
      console.log('🔌 Live Socket Service closed');
    }
  }
}

module.exports = new LiveSocketService();