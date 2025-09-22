const { Match, MatchStatistics, MatchEvent, Club, sequelize } = require('../models');
const { Op } = require('sequelize');
const { NotFoundError, ValidationError, UnauthorizedError } = require('../utils/errors');
const { log } = require('../config/logger');

// Constants for default values
const DEFAULT_POSSESSION_PERCENTAGE = 50;
const DEFAULT_PASS_ACCURACY = 0;
const DEFAULT_STATS_VALUE = 0;

class MatchStatisticsService {
  // Create or update match statistics
  async updateStatistics(matchId, statistics, userId) {
    const transaction = await sequelize.transaction();

    try {
      // Verify match exists and user has permission
      const match = await Match.findByPk(matchId, { transaction });

      if (!match) {
        throw new NotFoundError('Match');
      }

      // Check if user has permission to update statistics
      if (match.created_by_user_id !== userId) {
        throw new UnauthorizedError('Only match creator can update statistics');
      }

      // Check if statistics already exist
      let matchStats = await MatchStatistics.findOne({
        where: { match_id: matchId },
        transaction
      });

      if (matchStats) {
        // Update existing statistics
        await matchStats.update(statistics, { transaction });
      } else {
        // Create new statistics
        matchStats = await MatchStatistics.create({
          match_id: matchId,
          ...statistics
        }, { transaction });
      }

      await transaction.commit();
      return matchStats;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Get match statistics
  async getStatistics(matchId) {
    const match = await Match.findByPk(matchId);

    if (!match) {
      throw new NotFoundError('Match');
    }

    const statistics = await MatchStatistics.findOne({
      where: { match_id: matchId },
      include: [
        {
          model: Match,
          as: 'match',
          attributes: ['id', 'match_number', 'home_score', 'away_score', 'status']
        }
      ]
    });

    if (!statistics) {
      // Return empty statistics if none exist
      return {
        match_id: matchId,
        home_possession: DEFAULT_POSSESSION_PERCENTAGE,
        away_possession: DEFAULT_POSSESSION_PERCENTAGE,
        home_shots: DEFAULT_STATS_VALUE,
        away_shots: DEFAULT_STATS_VALUE,
        home_shots_on_target: DEFAULT_STATS_VALUE,
        away_shots_on_target: DEFAULT_STATS_VALUE,
        home_passes: DEFAULT_STATS_VALUE,
        away_passes: DEFAULT_STATS_VALUE,
        home_pass_accuracy: DEFAULT_PASS_ACCURACY,
        away_pass_accuracy: DEFAULT_PASS_ACCURACY,
        home_fouls: DEFAULT_STATS_VALUE,
        away_fouls: DEFAULT_STATS_VALUE,
        home_yellow_cards: DEFAULT_STATS_VALUE,
        away_yellow_cards: DEFAULT_STATS_VALUE,
        home_red_cards: DEFAULT_STATS_VALUE,
        away_red_cards: DEFAULT_STATS_VALUE,
        home_corners: DEFAULT_STATS_VALUE,
        away_corners: DEFAULT_STATS_VALUE,
        home_offsides: DEFAULT_STATS_VALUE,
        away_offsides: DEFAULT_STATS_VALUE,
        home_saves: DEFAULT_STATS_VALUE,
        away_saves: DEFAULT_STATS_VALUE,
        notes: null
      };
    }

    return statistics;
  }

  // Auto-calculate statistics from match events
  async calculateFromEvents(matchId) {
    const transaction = await sequelize.transaction();

    try {
      const match = await Match.findByPk(matchId, { transaction });

      if (!match) {
        throw new NotFoundError('Match');
      }

      // Get all match events
      const events = await MatchEvent.findAll({
        where: { match_id: matchId },
        transaction
      });

      // Initialize statistics
      const stats = {
        match_id: matchId,
        home_shots: 0,
        away_shots: 0,
        home_shots_on_target: 0,
        away_shots_on_target: 0,
        home_fouls: 0,
        away_fouls: 0,
        home_yellow_cards: 0,
        away_yellow_cards: 0,
        home_red_cards: 0,
        away_red_cards: 0,
        home_corners: 0,
        away_corners: 0,
        home_offsides: 0,
        away_offsides: 0,
        home_saves: 0,
        away_saves: 0
      };

      // Process events and calculate statistics
      events.forEach(event => {
        const isHome = event.team_side === 'home';
        const statsKey = isHome ? 'home' : 'away';

        switch (event.event_type) {
          case 'GOAL':
          case 'PENALTY':
            stats[`${statsKey}_shots_on_target`]++;
            stats[`${statsKey}_shots`]++;
            break;

          case 'SHOT':
            stats[`${statsKey}_shots`]++;
            break;

          case 'SHOT_ON_TARGET':
            stats[`${statsKey}_shots`]++;
            stats[`${statsKey}_shots_on_target`]++;
            break;

          case 'YELLOW_CARD':
            stats[`${statsKey}_yellow_cards`]++;
            break;

          case 'RED_CARD':
            stats[`${statsKey}_red_cards`]++;
            break;

          case 'FOUL':
            stats[`${statsKey}_fouls`]++;
            break;

          case 'CORNER':
            stats[`${statsKey}_corners`]++;
            break;

          case 'OFFSIDE':
            stats[`${statsKey}_offsides`]++;
            break;

          case 'SAVE':
            // Saves are counted for the defending team
            const defenseKey = isHome ? 'away' : 'home';
            stats[`${defenseKey}_saves`]++;
            break;
        }
      });

      // Check if statistics already exist
      let matchStats = await MatchStatistics.findOne({
        where: { match_id: matchId },
        transaction
      });

      if (matchStats) {
        // Update existing statistics
        await matchStats.update(stats, { transaction });
      } else {
        // Create new statistics
        matchStats = await MatchStatistics.create(stats, { transaction });
      }

      await transaction.commit();
      return matchStats;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Get match statistics comparison for multiple matches
  async getComparisonStats(matchIds) {
    if (!Array.isArray(matchIds) || matchIds.length === 0) {
      throw new ValidationError('Match IDs must be provided as an array');
    }

    const statistics = await MatchStatistics.findAll({
      where: {
        match_id: matchIds
      },
      include: [
        {
          model: Match,
          as: 'match',
          attributes: ['id', 'match_number', 'home_score', 'away_score', 'match_date']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Calculate averages and totals
    const aggregatedStats = {
      totalMatches: statistics.length,
      averages: {
        home_shots: 0,
        away_shots: 0,
        home_shots_on_target: 0,
        away_shots_on_target: 0,
        home_possession: 0,
        away_possession: 0,
        home_pass_accuracy: 0,
        away_pass_accuracy: 0,
        home_fouls: 0,
        away_fouls: 0,
        home_corners: 0,
        away_corners: 0
      },
      totals: {
        home_goals: 0,
        away_goals: 0,
        home_yellow_cards: 0,
        away_yellow_cards: 0,
        home_red_cards: 0,
        away_red_cards: 0
      }
    };

    if (statistics.length > 0) {
      statistics.forEach(stat => {
        // Add to averages
        aggregatedStats.averages.home_shots += stat.home_shots || 0;
        aggregatedStats.averages.away_shots += stat.away_shots || 0;
        aggregatedStats.averages.home_shots_on_target += stat.home_shots_on_target || 0;
        aggregatedStats.averages.away_shots_on_target += stat.away_shots_on_target || 0;
        aggregatedStats.averages.home_possession += stat.home_possession || DEFAULT_POSSESSION_PERCENTAGE;
        aggregatedStats.averages.away_possession += stat.away_possession || DEFAULT_POSSESSION_PERCENTAGE;
        aggregatedStats.averages.home_pass_accuracy += stat.home_pass_accuracy || DEFAULT_PASS_ACCURACY;
        aggregatedStats.averages.away_pass_accuracy += stat.away_pass_accuracy || DEFAULT_PASS_ACCURACY;
        aggregatedStats.averages.home_fouls += stat.home_fouls || 0;
        aggregatedStats.averages.away_fouls += stat.away_fouls || 0;
        aggregatedStats.averages.home_corners += stat.home_corners || 0;
        aggregatedStats.averages.away_corners += stat.away_corners || 0;

        // Add to totals
        aggregatedStats.totals.home_goals += stat.match.home_score || 0;
        aggregatedStats.totals.away_goals += stat.match.away_score || 0;
        aggregatedStats.totals.home_yellow_cards += stat.home_yellow_cards || 0;
        aggregatedStats.totals.away_yellow_cards += stat.away_yellow_cards || 0;
        aggregatedStats.totals.home_red_cards += stat.home_red_cards || 0;
        aggregatedStats.totals.away_red_cards += stat.away_red_cards || 0;
      });

      // Calculate averages
      const matchCount = statistics.length;
      Object.keys(aggregatedStats.averages).forEach(key => {
        aggregatedStats.averages[key] = Math.round(aggregatedStats.averages[key] / matchCount * 100) / 100;
      });
    }

    return {
      matches: statistics,
      aggregated: aggregatedStats
    };
  }

  // Get team statistics across multiple matches
  async getTeamStatistics(clubId, limit = 10) {
    const matches = await Match.findAll({
      where: {
        [Op.or]: [
          { home_club_id: clubId },
          { away_club_id: clubId }
        ],
        status: 'completed'
      },
      order: [['match_date', 'DESC']],
      limit: parseInt(limit),
      include: [
        {
          model: MatchStatistics,
          as: 'statistics',
          required: false // Include matches even without statistics
        }
      ]
    });

    if (matches.length === 0) {
      return {
        club_id: clubId,
        total_matches: 0,
        statistics: null
      };
    }

    // Calculate team-specific statistics
    const teamStats = {
      matches_played: matches.length,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_for: 0,
      goals_against: 0,
      total_shots: 0,
      total_shots_on_target: 0,
      average_possession: 0,
      total_fouls: 0,
      total_yellow_cards: 0,
      total_red_cards: 0
    };

    let possessionCount = 0;

    // Iterate through matches instead of statistics for consistent calculation
    matches.forEach(match => {
      const stat = match.statistics;
      const isHome = match.home_club_id === clubId;

      // Win/Draw/Loss calculation
      if (isHome) {
        teamStats.goals_for += match.home_score || 0;
        teamStats.goals_against += match.away_score || 0;

        if (match.home_score > match.away_score) teamStats.wins++;
        else if (match.home_score === match.away_score) teamStats.draws++;
        else teamStats.losses++;

        // Statistics (only if stats exist)
        if (stat) {
          teamStats.total_shots += stat.home_shots || DEFAULT_STATS_VALUE;
          teamStats.total_shots_on_target += stat.home_shots_on_target || DEFAULT_STATS_VALUE;
          teamStats.total_fouls += stat.home_fouls || DEFAULT_STATS_VALUE;
          teamStats.total_yellow_cards += stat.home_yellow_cards || DEFAULT_STATS_VALUE;
          teamStats.total_red_cards += stat.home_red_cards || DEFAULT_STATS_VALUE;

          if (stat.home_possession) {
            teamStats.average_possession += stat.home_possession;
            possessionCount++;
          }
        }
      } else {
        teamStats.goals_for += match.away_score || 0;
        teamStats.goals_against += match.home_score || 0;

        if (match.away_score > match.home_score) teamStats.wins++;
        else if (match.away_score === match.home_score) teamStats.draws++;
        else teamStats.losses++;

        // Statistics (only if stats exist)
        if (stat) {
          teamStats.total_shots += stat.away_shots || DEFAULT_STATS_VALUE;
          teamStats.total_shots_on_target += stat.away_shots_on_target || DEFAULT_STATS_VALUE;
          teamStats.total_fouls += stat.away_fouls || DEFAULT_STATS_VALUE;
          teamStats.total_yellow_cards += stat.away_yellow_cards || DEFAULT_STATS_VALUE;
          teamStats.total_red_cards += stat.away_red_cards || DEFAULT_STATS_VALUE;

          if (stat.away_possession) {
            teamStats.average_possession += stat.away_possession;
            possessionCount++;
          }
        }
      }
    });

    if (possessionCount > 0) {
      teamStats.average_possession = Math.round(teamStats.average_possession / possessionCount * 100) / 100;
    }

    return {
      club_id: clubId,
      statistics: teamStats,
      recent_matches: matches
    };
  }
}

module.exports = new MatchStatisticsService();