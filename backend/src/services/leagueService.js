const { Competition, Match, Club, User, MatchEvent } = require('../models');
const { Op } = require('sequelize');

class LeagueService {
  // 리그 대회 시즌별 순위표 계산
  async calculateLeagueStandings(competitionId) {
    try {
      // 대회 정보 조회
      const competition = await Competition.findByPk(competitionId, {
        include: [{
          model: Club,
          as: 'participants',
          through: { attributes: [] }
        }]
      });

      if (!competition || competition.competition_type !== 'league') {
        throw new Error('유효하지 않은 리그 대회입니다.');
      }

      // 리그 참가 클럽들의 경기 결과 조회
      const matches = await Match.findAll({
        where: {
          competition_id: competitionId,
          status: 'completed'
        },
        include: [
          { model: Club, as: 'homeClub', attributes: ['id', 'name'] },
          { model: Club, as: 'awayClub', attributes: ['id', 'name'] }
        ]
      });

      // 순위표 초기화
      const standings = {};
      competition.participants.forEach(club => {
        standings[club.id] = {
          club_id: club.id,
          club_name: club.name,
          matches_played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goals_for: 0,
          goals_against: 0,
          goal_difference: 0,
          points: 0
        };
      });

      // 경기 결과 계산
      matches.forEach(match => {
        const homeClubId = match.home_club_id;
        const awayClubId = match.away_club_id;
        const homeScore = match.home_score || 0;
        const awayScore = match.away_score || 0;

        if (standings[homeClubId] && standings[awayClubId]) {
          // 경기수 증가
          standings[homeClubId].matches_played++;
          standings[awayClubId].matches_played++;

          // 득실점 계산
          standings[homeClubId].goals_for += homeScore;
          standings[homeClubId].goals_against += awayScore;
          standings[awayClubId].goals_for += awayScore;
          standings[awayClubId].goals_against += homeScore;

          // 승부 결과 계산
          if (homeScore > awayScore) {
            // 홈팀 승리
            standings[homeClubId].wins++;
            standings[homeClubId].points += 3;
            standings[awayClubId].losses++;
          } else if (homeScore < awayScore) {
            // 원정팀 승리
            standings[awayClubId].wins++;
            standings[awayClubId].points += 3;
            standings[homeClubId].losses++;
          } else {
            // 무승부
            standings[homeClubId].draws++;
            standings[homeClubId].points += 1;
            standings[awayClubId].draws++;
            standings[awayClubId].points += 1;
          }
        }
      });

      // 득실차 계산
      Object.values(standings).forEach(standing => {
        standing.goal_difference = standing.goals_for - standing.goals_against;
      });

      // 순위 정렬 (승점 > 득실차 > 득점 > 이름)
      const sortedStandings = Object.values(standings).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
        if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for;
        return a.club_name.localeCompare(b.club_name);
      });

      // 순위 번호 추가
      sortedStandings.forEach((standing, index) => {
        standing.position = index + 1;
      });

      return sortedStandings;
    } catch (error) {
      throw new Error(`순위표 계산 실패: ${error.message}`);
    }
  }

  // 리그 대회 통계 정보 조회
  async getLeagueStatistics(competitionId) {
    try {
      const competition = await Competition.findByPk(competitionId);
      if (!competition || competition.competition_type !== 'league') {
        throw new Error('유효하지 않은 리그 대회입니다.');
      }

      // 전체 경기 통계
      const totalMatches = await Match.count({
        where: { competition_id: competitionId }
      });

      const completedMatches = await Match.count({
        where: {
          competition_id: competitionId,
          status: 'completed'
        }
      });

      const upcomingMatches = await Match.count({
        where: {
          competition_id: competitionId,
          status: 'scheduled'
        }
      });

      // 득점 통계
      const matches = await Match.findAll({
        where: {
          competition_id: competitionId,
          status: 'completed'
        },
        attributes: ['home_score', 'away_score']
      });

      let totalGoals = 0;
      let totalGames = matches.length;

      matches.forEach(match => {
        totalGoals += (match.home_score || 0) + (match.away_score || 0);
      });

      const averageGoalsPerGame = totalGames > 0 ? (totalGoals / totalGames).toFixed(2) : 0;

      // 최고 득점자 조회 (경기 이벤트 기반)
      const topScorers = await MatchEvent.findAll({
        where: {
          event_type: 'goal'
        },
        include: [{
          model: Match,
          where: { competition_id: competitionId },
          include: [
            { model: User, as: 'homePlayer', attributes: ['id', 'name'] },
            { model: User, as: 'awayPlayer', attributes: ['id', 'name'] }
          ]
        }],
        attributes: ['player_id'],
        group: ['player_id'],
        order: [[require('sequelize').fn('COUNT', 'player_id'), 'DESC']],
        limit: 10
      });

      return {
        competition_info: {
          id: competition.id,
          name: competition.name,
          season: competition.season,
          status: competition.status
        },
        match_statistics: {
          total_matches: totalMatches,
          completed_matches: completedMatches,
          upcoming_matches: upcomingMatches,
          total_goals: totalGoals,
          average_goals_per_game: parseFloat(averageGoalsPerGame)
        },
        top_scorers: topScorers
      };
    } catch (error) {
      throw new Error(`리그 통계 조회 실패: ${error.message}`);
    }
  }

  // 리그 대회 최근 경기 결과 조회
  async getRecentMatches(competitionId, limit = 10) {
    try {
      const recentMatches = await Match.findAll({
        where: {
          competition_id: competitionId,
          status: 'completed'
        },
        include: [
          {
            model: Club,
            as: 'homeClub',
            attributes: ['id', 'name', 'logo_url']
          },
          {
            model: Club,
            as: 'awayClub',
            attributes: ['id', 'name', 'logo_url']
          }
        ],
        order: [['match_date', 'DESC']],
        limit
      });

      return recentMatches.map(match => ({
        id: match.id,
        match_date: match.match_date,
        home_club: {
          id: match.homeClub.id,
          name: match.homeClub.name,
          logo_url: match.homeClub.logo_url
        },
        away_club: {
          id: match.awayClub.id,
          name: match.awayClub.name,
          logo_url: match.awayClub.logo_url
        },
        home_score: match.home_score,
        away_score: match.away_score,
        result: this.getMatchResult(match.home_score, match.away_score)
      }));
    } catch (error) {
      throw new Error(`최근 경기 조회 실패: ${error.message}`);
    }
  }

  // 리그 대회 다음 경기 일정 조회
  async getUpcomingMatches(competitionId, limit = 10) {
    try {
      const upcomingMatches = await Match.findAll({
        where: {
          competition_id: competitionId,
          status: 'scheduled',
          match_date: {
            [Op.gte]: new Date()
          }
        },
        include: [
          {
            model: Club,
            as: 'homeClub',
            attributes: ['id', 'name', 'logo_url']
          },
          {
            model: Club,
            as: 'awayClub',
            attributes: ['id', 'name', 'logo_url']
          }
        ],
        order: [['match_date', 'ASC']],
        limit
      });

      return upcomingMatches.map(match => ({
        id: match.id,
        match_date: match.match_date,
        venue: match.venue,
        home_club: {
          id: match.homeClub.id,
          name: match.homeClub.name,
          logo_url: match.homeClub.logo_url
        },
        away_club: {
          id: match.awayClub.id,
          name: match.awayClub.name,
          logo_url: match.awayClub.logo_url
        }
      }));
    } catch (error) {
      throw new Error(`다음 경기 일정 조회 실패: ${error.message}`);
    }
  }

  // 경기 결과 판정 헬퍼 메소드
  getMatchResult(homeScore, awayScore) {
    if (homeScore > awayScore) return 'home_win';
    if (homeScore < awayScore) return 'away_win';
    return 'draw';
  }

  // 리그 대회 시즌별 비교 분석
  async compareSeasons(currentSeasonId, previousSeasonId) {
    try {
      const currentStats = await this.getLeagueStatistics(currentSeasonId);
      const previousStats = await this.getLeagueStatistics(previousSeasonId);

      const currentStandings = await this.calculateLeagueStandings(currentSeasonId);
      const previousStandings = await this.calculateLeagueStandings(previousSeasonId);

      return {
        current_season: {
          statistics: currentStats,
          standings: currentStandings.slice(0, 5) // 상위 5팀
        },
        previous_season: {
          statistics: previousStats,
          standings: previousStandings.slice(0, 5)
        },
        comparison: {
          goal_difference: currentStats.match_statistics.average_goals_per_game -
                         previousStats.match_statistics.average_goals_per_game,
          matches_progress: {
            current: `${currentStats.match_statistics.completed_matches}/${currentStats.match_statistics.total_matches}`,
            previous: `${previousStats.match_statistics.completed_matches}/${previousStats.match_statistics.total_matches}`
          }
        }
      };
    } catch (error) {
      throw new Error(`시즌 비교 분석 실패: ${error.message}`);
    }
  }
}

module.exports = new LeagueService();