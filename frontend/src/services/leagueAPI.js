import api from './api';

// 리그 대시보드 API 서비스
export const leagueAPI = {
  // 리그 순위표 조회
  getLeagueStandings: (competitionId) =>
    api.get(`/leagues/${competitionId}/standings`),

  // 리그 통계 정보 조회
  getLeagueStatistics: (competitionId) =>
    api.get(`/leagues/${competitionId}/statistics`),

  // 리그 최근 경기 결과 조회
  getRecentMatches: (competitionId, limit = 10) =>
    api.get(`/leagues/${competitionId}/recent-matches`, { params: { limit } }),

  // 리그 다음 경기 일정 조회
  getUpcomingMatches: (competitionId, limit = 10) =>
    api.get(`/leagues/${competitionId}/upcoming-matches`, { params: { limit } }),

  // 리그 시즌별 비교 분석
  compareSeasons: (currentSeasonId, previousSeasonId) =>
    api.get(`/leagues/compare/${currentSeasonId}/${previousSeasonId}`),

  // 리그 대시보드 종합 정보 조회
  getLeagueDashboard: (competitionId) =>
    api.get(`/leagues/${competitionId}/dashboard`)
};