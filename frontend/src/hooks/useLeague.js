import { useQuery, useQueryClient } from '@tanstack/react-query';
import { leagueAPI } from '../services/leagueAPI';

// 리그 순위표 조회 훅
export const useLeagueStandings = (competitionId, options = {}) => {
  return useQuery({
    queryKey: ['league', 'standings', competitionId],
    queryFn: () => leagueAPI.getLeagueStandings(competitionId),
    enabled: !!competitionId,
    staleTime: 5 * 60 * 1000, // 5분
    cacheTime: 10 * 60 * 1000, // 10분
    ...options
  });
};

// 리그 통계 조회 훅
export const useLeagueStatistics = (competitionId, options = {}) => {
  return useQuery({
    queryKey: ['league', 'statistics', competitionId],
    queryFn: () => leagueAPI.getLeagueStatistics(competitionId),
    enabled: !!competitionId,
    staleTime: 10 * 60 * 1000, // 10분
    cacheTime: 15 * 60 * 1000, // 15분
    ...options
  });
};

// 리그 최근 경기 조회 훅
export const useRecentMatches = (competitionId, limit = 10, options = {}) => {
  return useQuery({
    queryKey: ['league', 'recent-matches', competitionId, limit],
    queryFn: () => leagueAPI.getRecentMatches(competitionId, limit),
    enabled: !!competitionId,
    staleTime: 2 * 60 * 1000, // 2분
    cacheTime: 5 * 60 * 1000, // 5분
    ...options
  });
};

// 리그 다음 경기 조회 훅
export const useUpcomingMatches = (competitionId, limit = 10, options = {}) => {
  return useQuery({
    queryKey: ['league', 'upcoming-matches', competitionId, limit],
    queryFn: () => leagueAPI.getUpcomingMatches(competitionId, limit),
    enabled: !!competitionId,
    staleTime: 5 * 60 * 1000, // 5분
    cacheTime: 10 * 60 * 1000, // 10분
    ...options
  });
};

// 리그 시즌 비교 조회 훅
export const useSeasonComparison = (currentSeasonId, previousSeasonId, options = {}) => {
  return useQuery({
    queryKey: ['league', 'season-comparison', currentSeasonId, previousSeasonId],
    queryFn: () => leagueAPI.compareSeasons(currentSeasonId, previousSeasonId),
    enabled: !!(currentSeasonId && previousSeasonId && currentSeasonId !== previousSeasonId),
    staleTime: 15 * 60 * 1000, // 15분
    cacheTime: 30 * 60 * 1000, // 30분
    ...options
  });
};

// 리그 대시보드 종합 조회 훅
export const useLeagueDashboard = (competitionId, options = {}) => {
  return useQuery({
    queryKey: ['league', 'dashboard', competitionId],
    queryFn: () => leagueAPI.getLeagueDashboard(competitionId),
    enabled: !!competitionId,
    staleTime: 3 * 60 * 1000, // 3분
    cacheTime: 5 * 60 * 1000, // 5분
    refetchInterval: 5 * 60 * 1000, // 5분마다 자동 새로고침
    ...options
  });
};

// 리그 데이터 무효화 유틸리티 훅
export const useInvalidateLeagueData = () => {
  const queryClient = useQueryClient();

  const invalidateLeagueData = (competitionId) => {
    if (competitionId) {
      // 특정 리그의 모든 데이터 무효화
      queryClient.invalidateQueries({
        queryKey: ['league'],
        predicate: (query) => query.queryKey.includes(competitionId)
      });
    } else {
      // 모든 리그 데이터 무효화
      queryClient.invalidateQueries({
        queryKey: ['league']
      });
    }
  };

  const invalidateStandings = (competitionId) => {
    queryClient.invalidateQueries({
      queryKey: ['league', 'standings', competitionId]
    });
  };

  const invalidateStatistics = (competitionId) => {
    queryClient.invalidateQueries({
      queryKey: ['league', 'statistics', competitionId]
    });
  };

  const invalidateMatches = (competitionId) => {
    queryClient.invalidateQueries({
      queryKey: ['league'],
      predicate: (query) =>
        query.queryKey.includes(competitionId) &&
        (query.queryKey.includes('recent-matches') || query.queryKey.includes('upcoming-matches'))
    });
  };

  const invalidateDashboard = (competitionId) => {
    queryClient.invalidateQueries({
      queryKey: ['league', 'dashboard', competitionId]
    });
  };

  return {
    invalidateLeagueData,
    invalidateStandings,
    invalidateStatistics,
    invalidateMatches,
    invalidateDashboard
  };
};

// 리그 데이터 프리페치 훅
export const usePrefetchLeagueData = () => {
  const queryClient = useQueryClient();

  const prefetchLeagueDashboard = async (competitionId) => {
    await queryClient.prefetchQuery({
      queryKey: ['league', 'dashboard', competitionId],
      queryFn: () => leagueAPI.getLeagueDashboard(competitionId),
      staleTime: 3 * 60 * 1000
    });
  };

  const prefetchLeagueStandings = async (competitionId) => {
    await queryClient.prefetchQuery({
      queryKey: ['league', 'standings', competitionId],
      queryFn: () => leagueAPI.getLeagueStandings(competitionId),
      staleTime: 5 * 60 * 1000
    });
  };

  return {
    prefetchLeagueDashboard,
    prefetchLeagueStandings
  };
};