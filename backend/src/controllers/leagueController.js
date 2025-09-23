const leagueService = require('../services/leagueService');
const { validationResult } = require('express-validator');

// 리그 순위표 조회
const getLeagueStandings = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '입력 데이터가 유효하지 않습니다.',
        errors: errors.array()
      });
    }

    const { competitionId } = req.params;

    const standings = await leagueService.calculateLeagueStandings(competitionId);

    res.status(200).json({
      success: true,
      message: '리그 순위표 조회 성공',
      data: standings
    });
  } catch (error) {
    console.error('League standings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '리그 순위표 조회 중 오류가 발생했습니다.'
    });
  }
};

// 리그 통계 정보 조회
const getLeagueStatistics = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '입력 데이터가 유효하지 않습니다.',
        errors: errors.array()
      });
    }

    const { competitionId } = req.params;

    const statistics = await leagueService.getLeagueStatistics(competitionId);

    res.status(200).json({
      success: true,
      message: '리그 통계 조회 성공',
      data: statistics
    });
  } catch (error) {
    console.error('League statistics error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '리그 통계 조회 중 오류가 발생했습니다.'
    });
  }
};

// 리그 최근 경기 결과 조회
const getRecentMatches = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '입력 데이터가 유효하지 않습니다.',
        errors: errors.array()
      });
    }

    const { competitionId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    if (limit < 1 || limit > 50) {
      return res.status(400).json({
        success: false,
        message: 'limit은 1-50 사이의 값이어야 합니다.'
      });
    }

    const recentMatches = await leagueService.getRecentMatches(competitionId, limit);

    res.status(200).json({
      success: true,
      message: '최근 경기 결과 조회 성공',
      data: recentMatches
    });
  } catch (error) {
    console.error('Recent matches error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '최근 경기 결과 조회 중 오류가 발생했습니다.'
    });
  }
};

// 리그 다음 경기 일정 조회
const getUpcomingMatches = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '입력 데이터가 유효하지 않습니다.',
        errors: errors.array()
      });
    }

    const { competitionId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    if (limit < 1 || limit > 50) {
      return res.status(400).json({
        success: false,
        message: 'limit은 1-50 사이의 값이어야 합니다.'
      });
    }

    const upcomingMatches = await leagueService.getUpcomingMatches(competitionId, limit);

    res.status(200).json({
      success: true,
      message: '다음 경기 일정 조회 성공',
      data: upcomingMatches
    });
  } catch (error) {
    console.error('Upcoming matches error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '다음 경기 일정 조회 중 오류가 발생했습니다.'
    });
  }
};

// 리그 시즌별 비교 분석
const compareSeasons = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '입력 데이터가 유효하지 않습니다.',
        errors: errors.array()
      });
    }

    const { currentSeasonId, previousSeasonId } = req.params;

    if (currentSeasonId === previousSeasonId) {
      return res.status(400).json({
        success: false,
        message: '현재 시즌과 이전 시즌이 동일할 수 없습니다.'
      });
    }

    const comparison = await leagueService.compareSeasons(currentSeasonId, previousSeasonId);

    res.status(200).json({
      success: true,
      message: '시즌 비교 분석 성공',
      data: comparison
    });
  } catch (error) {
    console.error('Season comparison error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '시즌 비교 분석 중 오류가 발생했습니다.'
    });
  }
};

// 리그 대시보드 종합 정보 조회
const getLeagueDashboard = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '입력 데이터가 유효하지 않습니다.',
        errors: errors.array()
      });
    }

    const { competitionId } = req.params;

    // 병렬로 모든 데이터 조회
    const [standings, statistics, recentMatches, upcomingMatches] = await Promise.all([
      leagueService.calculateLeagueStandings(competitionId),
      leagueService.getLeagueStatistics(competitionId),
      leagueService.getRecentMatches(competitionId, 5),
      leagueService.getUpcomingMatches(competitionId, 5)
    ]);

    const dashboard = {
      standings: standings.slice(0, 10), // 상위 10팀만 표시
      statistics,
      recent_matches: recentMatches,
      upcoming_matches: upcomingMatches,
      last_updated: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      message: '리그 대시보드 조회 성공',
      data: dashboard
    });
  } catch (error) {
    console.error('League dashboard error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '리그 대시보드 조회 중 오류가 발생했습니다.'
    });
  }
};

module.exports = {
  getLeagueStandings,
  getLeagueStatistics,
  getRecentMatches,
  getUpcomingMatches,
  compareSeasons,
  getLeagueDashboard
};