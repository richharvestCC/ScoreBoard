const express = require('express');
const router = express.Router();
const liveScoringController = require('../controllers/liveScoringController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { rateLimiter } = require('../middleware/rateLimiter');

// 모든 라우트에 인증 필요
router.use(requireAuth);

/**
 * 라이브 경기 시작
 * POST /api/live/:matchId/start
 */
router.post(
  '/:matchId/start',
  requireRole(['admin', 'moderator', 'organizer']),
  rateLimiter('live_action', 10, 60), // 10 requests per minute
  liveScoringController.startLiveMatch
);

/**
 * 라이브 경기 종료
 * POST /api/live/:matchId/end
 */
router.post(
  '/:matchId/end',
  requireRole(['admin', 'moderator', 'organizer']),
  rateLimiter('live_action', 10, 60),
  liveScoringController.endLiveMatch
);

/**
 * 라이브 스코어 업데이트
 * PUT /api/live/:matchId/score
 */
router.put(
  '/:matchId/score',
  requireRole(['admin', 'moderator', 'organizer']),
  rateLimiter('live_update', 30, 60), // 30 requests per minute
  liveScoringController.updateLiveScore
);

/**
 * 라이브 경기 이벤트 추가
 * POST /api/live/:matchId/event
 */
router.post(
  '/:matchId/event',
  requireRole(['admin', 'moderator', 'organizer']),
  rateLimiter('live_update', 30, 60),
  liveScoringController.addLiveEvent
);

/**
 * 라이브 경기 통계 업데이트
 * PUT /api/live/:matchId/stats
 */
router.put(
  '/:matchId/stats',
  requireRole(['admin', 'moderator', 'organizer']),
  rateLimiter('live_update', 20, 60), // 20 requests per minute
  liveScoringController.updateLiveStats
);

/**
 * 라이브 경기 정보 조회
 * GET /api/live/:matchId
 */
router.get(
  '/:matchId',
  liveScoringController.getLiveMatchInfo
);

/**
 * 현재 라이브 경기 목록
 * GET /api/live/matches
 */
router.get(
  '/matches/live',
  liveScoringController.getLiveMatches
);

/**
 * 라이브 소켓 통계 조회
 * GET /api/live/stats
 */
router.get(
  '/stats/live',
  requireRole(['admin', 'moderator']),
  liveScoringController.getLiveStats
);

module.exports = router;