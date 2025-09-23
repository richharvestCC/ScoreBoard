import api from './api';

export const schedulingAPI = {
  // 자동 스케줄링 실행
  autoScheduleMatches: (competitionId, scheduleData) =>
    api.post(`/scheduling/competitions/${competitionId}/auto-schedule`, scheduleData),

  // 수동 경기 스케줄링
  scheduleMatch: (matchId, scheduleData) =>
    api.post(`/scheduling/matches/${matchId}/schedule`, scheduleData),

  // 경기 재스케줄링
  rescheduleMatch: (matchId, scheduleData) =>
    api.put(`/scheduling/matches/${matchId}/reschedule`, scheduleData),

  // 스케줄 충돌 확인
  checkScheduleConflict: (matchId, conflictData) =>
    api.post(`/scheduling/matches/${matchId}/check-conflict`, conflictData),

  // 스케줄링 통계 조회
  getSchedulingStats: (competitionId) =>
    api.get(`/scheduling/competitions/${competitionId}/stats`),

  // 대회별 경기 스케줄 조회
  getCompetitionSchedule: (competitionId, params = {}) =>
    api.get(`/scheduling/competitions/${competitionId}/schedule`, { params }),

  // 스케줄링 상태별 경기 조회
  getMatchesByStatus: (competitionId, status, params = {}) =>
    api.get(`/scheduling/competitions/${competitionId}/status/${status}`, { params }),

  // 가용 시간대 조회
  getAvailableTimeSlots: (params) =>
    api.get('/scheduling/available-slots', { params })
};