import api from './api';

export const liveScoringAPI = {
  // 라이브 경기 시작
  startLiveMatch: (matchId) =>
    api.post(`/live/${matchId}/start`),

  // 라이브 경기 종료
  endLiveMatch: (matchId, data = {}) =>
    api.post(`/live/${matchId}/end`, data),

  // 라이브 스코어 업데이트
  updateLiveScore: (matchId, scoreData) =>
    api.put(`/live/${matchId}/score`, scoreData),

  // 라이브 경기 이벤트 추가
  addLiveEvent: (matchId, eventData) =>
    api.post(`/live/${matchId}/event`, eventData),

  // 라이브 경기 통계 업데이트
  updateLiveStats: (matchId, statsData) =>
    api.put(`/live/${matchId}/stats`, statsData),

  // 라이브 경기 정보 조회
  getLiveMatchInfo: (matchId) =>
    api.get(`/live/${matchId}`),

  // 현재 라이브 경기 목록
  getLiveMatches: (params = {}) =>
    api.get('/live/matches/live', { params }),

  // 라이브 소켓 통계 조회
  getLiveStats: () =>
    api.get('/live/stats/live')
};