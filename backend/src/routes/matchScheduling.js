const express = require('express');
const router = express.Router();
const matchSchedulingController = require('../controllers/matchSchedulingController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { rateLimiter } = require('../middleware/rateLimiter');

// 모든 라우트에 인증 필요
router.use(requireAuth);

/**
 * 자동 스케줄링 실행
 * POST /api/scheduling/competitions/:competitionId/auto-schedule
 */
router.post(
  '/competitions/:competitionId/auto-schedule',
  requireRole(['admin', 'moderator', 'organizer']),
  rateLimiter, // Use default rate limiter
  matchSchedulingController.autoScheduleMatches
);

/**
 * 수동 경기 스케줄링
 * POST /api/scheduling/matches/:matchId/schedule
 */
router.post(
  '/matches/:matchId/schedule',
  requireRole(['admin', 'moderator', 'organizer']),
  rateLimiter('scheduling', 20, 60), // 20 requests per minute
  matchSchedulingController.scheduleMatch
);

/**
 * 경기 재스케줄링
 * PUT /api/scheduling/matches/:matchId/reschedule
 */
router.put(
  '/matches/:matchId/reschedule',
  requireRole(['admin', 'moderator', 'organizer']),
  rateLimiter('scheduling', 20, 60),
  matchSchedulingController.rescheduleMatch
);

/**
 * 스케줄 충돌 확인
 * POST /api/scheduling/matches/:matchId/check-conflict
 */
router.post(
  '/matches/:matchId/check-conflict',
  requireRole(['admin', 'moderator', 'organizer']),
  matchSchedulingController.checkScheduleConflict
);

/**
 * 스케줄링 통계 조회
 * GET /api/scheduling/competitions/:competitionId/stats
 */
router.get(
  '/competitions/:competitionId/stats',
  matchSchedulingController.getSchedulingStats
);

/**
 * 대회별 경기 스케줄 조회
 * GET /api/scheduling/competitions/:competitionId/schedule
 */
router.get(
  '/competitions/:competitionId/schedule',
  matchSchedulingController.getCompetitionSchedule
);

/**
 * 스케줄링 상태별 경기 조회
 * GET /api/scheduling/competitions/:competitionId/status/:status
 */
router.get(
  '/competitions/:competitionId/status/:status',
  matchSchedulingController.getMatchesByStatus
);

/**
 * 가용 시간대 조회
 * GET /api/scheduling/available-slots
 */
router.get(
  '/available-slots',
  matchSchedulingController.getAvailableTimeSlots
);

module.exports = router;