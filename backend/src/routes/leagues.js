const express = require('express');
// const { param, query } = require('express-validator');
const leagueController = require('../controllers/leagueController');
const { authenticateToken } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// 리그 관련 API 요청 제한 설정
const leagueRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100회 요청
  message: {
    success: false,
    message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 모든 리그 라우트에 인증 및 제한 적용
router.use(authenticateToken);
router.use(leagueRateLimit);

// 입력 검증 규칙 (임시 비활성화)
// const competitionIdValidation = [
//   param('competitionId')
//     .isInt({ min: 1 })
//     .withMessage('유효한 대회 ID를 입력해주세요.')
// ];

// const limitValidation = [
//   query('limit')
//     .optional()
//     .isInt({ min: 1, max: 50 })
//     .withMessage('limit은 1-50 사이의 값이어야 합니다.')
// ];

// const seasonComparisonValidation = [
//   param('currentSeasonId')
//     .isInt({ min: 1 })
//     .withMessage('유효한 현재 시즌 ID를 입력해주세요.'),
//   param('previousSeasonId')
//     .isInt({ min: 1 })
//     .withMessage('유효한 이전 시즌 ID를 입력해주세요.')
// ];

// 리그 순위표 조회
router.get(
  '/:competitionId/standings',
  // competitionIdValidation,
  leagueController.getLeagueStandings
);

// 리그 통계 정보 조회
router.get(
  '/:competitionId/statistics',
  // competitionIdValidation,
  leagueController.getLeagueStatistics
);

// 리그 최근 경기 결과 조회
router.get(
  '/:competitionId/recent-matches',
  // [...competitionIdValidation, ...limitValidation],
  leagueController.getRecentMatches
);

// 리그 다음 경기 일정 조회
router.get(
  '/:competitionId/upcoming-matches',
  // [...competitionIdValidation, ...limitValidation],
  leagueController.getUpcomingMatches
);

// 리그 시즌별 비교 분석
router.get(
  '/compare/:currentSeasonId/:previousSeasonId',
  // seasonComparisonValidation,
  leagueController.compareSeasons
);

// 리그 대시보드 종합 정보 조회
router.get(
  '/:competitionId/dashboard',
  // competitionIdValidation,
  leagueController.getLeagueDashboard
);

// 에러 핸들링 미들웨어
router.use((error, req, res, next) => {
  console.error('League routes error:', error);

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: '입력 데이터 검증 실패',
      errors: error.details || error.message
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: '잘못된 ID 형식입니다.'
    });
  }

  res.status(500).json({
    success: false,
    message: '리그 관련 처리 중 오류가 발생했습니다.'
  });
});

module.exports = router;