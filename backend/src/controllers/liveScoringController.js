const { Match, Club, User, MatchEvent, MatchStatistics } = require('../models');
const liveSocketService = require('../services/liveSocketService');
const { Op } = require('sequelize');
const moment = require('moment-timezone');

/**
 * 라이브 경기 시작
 */
const startLiveMatch = async (req, res) => {
  try {
    const { matchId } = req.params;

    // 경기 존재 확인
    const match = await Match.findByPk(matchId, {
      include: [
        { model: Club, as: 'homeClub' },
        { model: Club, as: 'awayClub' }
      ]
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: '경기를 찾을 수 없습니다.'
      });
    }

    // 권한 확인
    if (!req.user.hasAnyRole(['admin', 'moderator', 'organizer']) && match.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '라이브 경기를 시작할 권한이 없습니다.'
      });
    }

    // 경기 상태 확인
    if (match.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: '예정된 경기만 라이브로 시작할 수 있습니다.'
      });
    }

    // 경기 상태를 진행중으로 변경
    await match.update({
      status: 'in_progress',
      match_date: match.match_date || new Date() // 경기 날짜가 없다면 현재 시간으로
    });

    // 초기 경기 통계 생성
    const matchStats = await MatchStatistics.findOne({ where: { match_id: matchId } });
    if (!matchStats) {
      await MatchStatistics.create({
        match_id: matchId,
        home_possession: 50,
        away_possession: 50,
        home_shots: 0,
        away_shots: 0,
        home_shots_on_target: 0,
        away_shots_on_target: 0,
        home_corners: 0,
        away_corners: 0,
        home_fouls: 0,
        away_fouls: 0,
        home_yellow_cards: 0,
        away_yellow_cards: 0,
        home_red_cards: 0,
        away_red_cards: 0
      });
    }

    // 경기 시작 이벤트 생성
    await MatchEvent.create({
      match_id: matchId,
      event_type: 'match_start',
      minute: 0,
      description: '경기가 시작되었습니다.',
      created_by: req.user.id
    });

    // 모든 연결된 클라이언트에게 경기 시작 알림
    liveSocketService.broadcastToMatch(matchId, 'match-started', {
      matchId,
      match: await Match.findByPk(matchId, {
        include: [
          { model: Club, as: 'homeClub' },
          { model: Club, as: 'awayClub' }
        ]
      }),
      startedBy: req.user.name,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: '라이브 경기가 시작되었습니다.',
      data: {
        matchId,
        status: 'in_progress',
        startTime: new Date()
      }
    });

  } catch (error) {
    console.error('Start live match error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '라이브 경기 시작 중 오류가 발생했습니다.'
    });
  }
};

/**
 * 라이브 경기 종료
 */
const endLiveMatch = async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findByPk(matchId);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: '경기를 찾을 수 없습니다.'
      });
    }

    // 권한 확인
    if (!req.user.hasAnyRole(['admin', 'moderator', 'organizer']) && match.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '라이브 경기를 종료할 권한이 없습니다.'
      });
    }

    // 경기 상태 확인
    if (match.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: '진행 중인 경기만 종료할 수 있습니다.'
      });
    }

    // 경기 상태를 완료로 변경
    await match.update({ status: 'completed' });

    // 경기 종료 이벤트 생성
    await MatchEvent.create({
      match_id: matchId,
      event_type: 'match_end',
      minute: req.body.minute || 90,
      description: '경기가 종료되었습니다.',
      created_by: req.user.id
    });

    // 모든 연결된 클라이언트에게 경기 종료 알림
    liveSocketService.broadcastToMatch(matchId, 'match-ended', {
      matchId,
      finalScore: {
        home: match.home_score,
        away: match.away_score
      },
      endedBy: req.user.name,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: '라이브 경기가 종료되었습니다.',
      data: {
        matchId,
        status: 'completed',
        finalScore: {
          home: match.home_score,
          away: match.away_score
        },
        endTime: new Date()
      }
    });

  } catch (error) {
    console.error('End live match error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '라이브 경기 종료 중 오류가 발생했습니다.'
    });
  }
};

/**
 * 라이브 스코어 업데이트
 */
const updateLiveScore = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { homeScore, awayScore, minute } = req.body;

    const match = await Match.findByPk(matchId);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: '경기를 찾을 수 없습니다.'
      });
    }

    // 권한 확인
    if (!req.user.hasAnyRole(['admin', 'moderator', 'organizer']) && match.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '스코어를 업데이트할 권한이 없습니다.'
      });
    }

    // 경기 상태 확인
    if (match.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: '진행 중인 경기의 스코어만 업데이트할 수 있습니다.'
      });
    }

    // 스코어 유효성 검사
    if (typeof homeScore !== 'number' || typeof awayScore !== 'number' ||
        homeScore < 0 || awayScore < 0) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 스코어입니다.'
      });
    }

    const oldHomeScore = match.home_score;
    const oldAwayScore = match.away_score;

    // 스코어 업데이트
    await match.update({
      home_score: homeScore,
      away_score: awayScore
    });

    // 골 이벤트 생성 (스코어가 증가한 경우)
    if (homeScore > oldHomeScore) {
      for (let i = oldHomeScore; i < homeScore; i++) {
        await MatchEvent.create({
          match_id: matchId,
          event_type: 'goal',
          minute: minute || 90,
          club_id: match.home_club_id,
          description: `홈팀 골! (${i + 1}-${awayScore})`,
          created_by: req.user.id
        });
      }
    }

    if (awayScore > oldAwayScore) {
      for (let i = oldAwayScore; i < awayScore; i++) {
        await MatchEvent.create({
          match_id: matchId,
          event_type: 'goal',
          minute: minute || 90,
          club_id: match.away_club_id,
          description: `원정팀 골! (${homeScore}-${i + 1})`,
          created_by: req.user.id
        });
      }
    }

    // WebSocket을 통해 실시간 업데이트
    liveSocketService.broadcastToMatch(matchId, 'score-updated', {
      matchId,
      homeScore,
      awayScore,
      minute: minute || null,
      updatedBy: req.user.name,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: '스코어가 업데이트되었습니다.',
      data: {
        matchId,
        homeScore,
        awayScore,
        minute
      }
    });

  } catch (error) {
    console.error('Update live score error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '스코어 업데이트 중 오류가 발생했습니다.'
    });
  }
};

/**
 * 라이브 경기 이벤트 추가
 */
const addLiveEvent = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { eventType, minute, playerId, clubId, description } = req.body;

    const match = await Match.findByPk(matchId);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: '경기를 찾을 수 없습니다.'
      });
    }

    // 권한 확인
    if (!req.user.hasAnyRole(['admin', 'moderator', 'organizer']) && match.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '경기 이벤트를 추가할 권한이 없습니다.'
      });
    }

    // 경기 상태 확인
    if (match.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: '진행 중인 경기에만 이벤트를 추가할 수 있습니다.'
      });
    }

    // 유효한 이벤트 타입 확인
    const validEventTypes = ['goal', 'yellow_card', 'red_card', 'substitution', 'corner', 'foul', 'offside'];
    if (!validEventTypes.includes(eventType)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 이벤트 타입입니다.'
      });
    }

    // 이벤트 생성
    const matchEvent = await MatchEvent.create({
      match_id: matchId,
      event_type: eventType,
      minute: minute || 0,
      player_id: playerId || null,
      club_id: clubId || null,
      description: description || `${eventType} 이벤트`,
      created_by: req.user.id
    });

    // 통계 업데이트 (일부 이벤트의 경우)
    const matchStats = await MatchStatistics.findOne({ where: { match_id: matchId } });
    if (matchStats && clubId) {
      const isHomeTeam = clubId === match.home_club_id;

      switch (eventType) {
        case 'yellow_card':
          if (isHomeTeam) {
            await matchStats.increment('home_yellow_cards');
          } else {
            await matchStats.increment('away_yellow_cards');
          }
          break;
        case 'red_card':
          if (isHomeTeam) {
            await matchStats.increment('home_red_cards');
          } else {
            await matchStats.increment('away_red_cards');
          }
          break;
        case 'corner':
          if (isHomeTeam) {
            await matchStats.increment('home_corners');
          } else {
            await matchStats.increment('away_corners');
          }
          break;
        case 'foul':
          if (isHomeTeam) {
            await matchStats.increment('home_fouls');
          } else {
            await matchStats.increment('away_fouls');
          }
          break;
      }
    }

    // WebSocket을 통해 실시간 업데이트
    liveSocketService.broadcastToMatch(matchId, 'match-event-added', {
      matchId,
      event: matchEvent,
      addedBy: req.user.name,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: '경기 이벤트가 추가되었습니다.',
      data: matchEvent
    });

  } catch (error) {
    console.error('Add live event error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '이벤트 추가 중 오류가 발생했습니다.'
    });
  }
};

/**
 * 라이브 경기 통계 업데이트
 */
const updateLiveStats = async (req, res) => {
  try {
    const { matchId } = req.params;
    const stats = req.body;

    const match = await Match.findByPk(matchId);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: '경기를 찾을 수 없습니다.'
      });
    }

    // 권한 확인
    if (!req.user.hasAnyRole(['admin', 'moderator', 'organizer']) && match.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '경기 통계를 업데이트할 권한이 없습니다.'
      });
    }

    // 경기 상태 확인
    if (match.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: '진행 중인 경기의 통계만 업데이트할 수 있습니다.'
      });
    }

    // 통계 업데이트
    const [matchStats] = await MatchStatistics.findOrCreate({
      where: { match_id: matchId },
      defaults: stats
    });

    await matchStats.update(stats);

    // WebSocket을 통해 실시간 업데이트
    liveSocketService.broadcastToMatch(matchId, 'stats-updated', {
      matchId,
      stats: matchStats,
      updatedBy: req.user.name,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: '경기 통계가 업데이트되었습니다.',
      data: matchStats
    });

  } catch (error) {
    console.error('Update live stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '통계 업데이트 중 오류가 발생했습니다.'
    });
  }
};

/**
 * 라이브 경기 정보 조회
 */
const getLiveMatchInfo = async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findByPk(matchId, {
      include: [
        { model: Club, as: 'homeClub' },
        { model: Club, as: 'awayClub' },
        {
          model: MatchEvent,
          as: 'events',
          order: [['minute', 'ASC'], ['createdAt', 'ASC']]
        },
        {
          model: MatchStatistics,
          as: 'statistics'
        }
      ]
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: '경기를 찾을 수 없습니다.'
      });
    }

    // 라이브 통계 가져오기
    const liveStats = liveSocketService.getLiveMatchStats();
    const currentMatchStats = liveStats.matchDetails.find(m => m.matchId == matchId);

    res.json({
      success: true,
      data: {
        match,
        liveInfo: {
          viewerCount: currentMatchStats?.viewerCount || 0,
          managerCount: currentMatchStats?.managerCount || 0,
          lastUpdate: currentMatchStats?.lastUpdate || null,
          isLive: match.status === 'in_progress'
        }
      }
    });

  } catch (error) {
    console.error('Get live match info error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '라이브 경기 정보 조회 중 오류가 발생했습니다.'
    });
  }
};

/**
 * 현재 라이브 경기 목록
 */
const getLiveMatches = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // 진행 중인 경기들 조회
    const { rows: liveMatches, count: total } = await Match.findAndCountAll({
      where: { status: 'in_progress' },
      include: [
        { model: Club, as: 'homeClub' },
        { model: Club, as: 'awayClub' }
      ],
      order: [['match_date', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    // 각 경기의 라이브 통계 추가
    const liveStats = liveSocketService.getLiveMatchStats();
    const matchesWithLiveInfo = liveMatches.map(match => {
      const liveInfo = liveStats.matchDetails.find(m => m.matchId == match.id);
      return {
        ...match.toJSON(),
        liveInfo: {
          viewerCount: liveInfo?.viewerCount || 0,
          managerCount: liveInfo?.managerCount || 0,
          lastUpdate: liveInfo?.lastUpdate || null
        }
      };
    });

    res.json({
      success: true,
      data: {
        matches: matchesWithLiveInfo,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        },
        globalStats: {
          totalLiveMatches: liveStats.totalLiveMatches,
          totalViewers: liveStats.totalViewers
        }
      }
    });

  } catch (error) {
    console.error('Get live matches error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '라이브 경기 목록 조회 중 오류가 발생했습니다.'
    });
  }
};

/**
 * 라이브 소켓 통계 조회
 */
const getLiveStats = async (req, res) => {
  try {
    const stats = liveSocketService.getLiveMatchStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get live stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '라이브 통계 조회 중 오류가 발생했습니다.'
    });
  }
};

module.exports = {
  startLiveMatch,
  endLiveMatch,
  updateLiveScore,
  addLiveEvent,
  updateLiveStats,
  getLiveMatchInfo,
  getLiveMatches,
  getLiveStats
};