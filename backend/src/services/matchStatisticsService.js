const { Match, MatchStatistics, MatchEvent, Club, sequelize } = require('../models');
const { Op } = require('sequelize');
const { NotFoundError, ValidationError, UnauthorizedError } = require('../utils/errors');

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
        home_possession: 50,
        away_possession: 50,
        home_shots: 0,
        away_shots: 0,
        home_shots_on_target: 0,
        away_shots_on_target: 0,
        home_passes: 0,
        away_passes: 0,
        home_pass_accuracy: 0,
        away_pass_accuracy: 0,
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
        away_saves: 0,
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

  // Get match statistics comparison for multiple matches - Optimized version
  async getComparisonStats(matchIds) {
    if (!Array.isArray(matchIds) || matchIds.length === 0) {
      throw new ValidationError('Match IDs must be provided as an array');
    }

    // Use Match as the primary model to ensure we get matches even without statistics
    const matchesWithStats = await Match.findAll({
      where: {
        id: matchIds
      },
      include: [
        {
          model: MatchStatistics,
          as: 'statistics',
          required: false // LEFT JOIN to include matches without statistics
        }
      ],
      attributes: ['id', 'match_number', 'home_score', 'away_score', 'match_date'],
      order: [['match_date', 'DESC']]
    });

    // Convert to the format expected by the rest of the function
    const statistics = matchesWithStats
      .filter(match => match.statistics) // Only include matches that have statistics
      .map(match => {
        const stat = match.statistics;
        stat.match = {
          id: match.id,
          match_number: match.match_number,
          home_score: match.home_score,
          away_score: match.away_score,
          match_date: match.match_date
        };
        return stat;
      });

    // Calculate averages and totals
    const aggregatedStats = {
      totalMatches: statistics.length,
      totalMatchesRequested: matchIds.length,
      matchesWithoutStats: matchIds.length - statistics.length,
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
        aggregatedStats.averages.home_possession += stat.home_possession || 50;
        aggregatedStats.averages.away_possession += stat.away_possession || 50;
        aggregatedStats.averages.home_pass_accuracy += parseFloat(stat.home_pass_accuracy) || 0;
        aggregatedStats.averages.away_pass_accuracy += parseFloat(stat.away_pass_accuracy) || 0;
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

  // Get team statistics across multiple matches - Optimized version with eager loading
  async getTeamStatistics(clubId, limit = 10) {
    // Single query with eager loading to avoid N+1 problem
    const matchesWithStats = await Match.findAll({
      where: {
        [Op.or]: [
          { home_club_id: clubId },
          { away_club_id: clubId }
        ],
        status: 'completed'
      },
      include: [
        {
          model: MatchStatistics,
          as: 'statistics', // Need to add this association in Match model
          required: false // LEFT JOIN to include matches without statistics
        },
        {
          model: Club,
          as: 'homeClub',
          attributes: ['id', 'name']
        },
        {
          model: Club,
          as: 'awayClub',
          attributes: ['id', 'name']
        }
      ],
      order: [['match_date', 'DESC']],
      limit: parseInt(limit)
    });

    if (matchesWithStats.length === 0) {
      return {
        club_id: clubId,
        total_matches: 0,
        statistics: null
      };
    }

    // Calculate team-specific statistics
    const teamStats = {
      matches_played: matchesWithStats.length,
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

    matchesWithStats.forEach(match => {
      const isHome = match.home_club_id === clubId;
      const stats = match.statistics; // Statistics are now eagerly loaded

      // Win/Draw/Loss calculation
      if (isHome) {
        teamStats.goals_for += match.home_score || 0;
        teamStats.goals_against += match.away_score || 0;

        if (match.home_score > match.away_score) teamStats.wins++;
        else if (match.home_score === match.away_score) teamStats.draws++;
        else teamStats.losses++;

        // Statistics (only if statistics exist)
        if (stats) {
          teamStats.total_shots += stats.home_shots || 0;
          teamStats.total_shots_on_target += stats.home_shots_on_target || 0;
          teamStats.total_fouls += stats.home_fouls || 0;
          teamStats.total_yellow_cards += stats.home_yellow_cards || 0;
          teamStats.total_red_cards += stats.home_red_cards || 0;

          if (stats.home_possession) {
            teamStats.average_possession += stats.home_possession;
            possessionCount++;
          }
        }
      } else {
        teamStats.goals_for += match.away_score || 0;
        teamStats.goals_against += match.home_score || 0;

        if (match.away_score > match.home_score) teamStats.wins++;
        else if (match.away_score === match.home_score) teamStats.draws++;
        else teamStats.losses++;

        // Statistics (only if statistics exist)
        if (stats) {
          teamStats.total_shots += stats.away_shots || 0;
          teamStats.total_shots_on_target += stats.away_shots_on_target || 0;
          teamStats.total_fouls += stats.away_fouls || 0;
          teamStats.total_yellow_cards += stats.away_yellow_cards || 0;
          teamStats.total_red_cards += stats.away_red_cards || 0;

          if (stats.away_possession) {
            teamStats.average_possession += stats.away_possession;
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
      recent_matches: matchesWithStats.map(match => ({
        id: match.id,
        match_date: match.match_date,
        home_score: match.home_score,
        away_score: match.away_score,
        home_club: match.homeClub,
        away_club: match.awayClub,
        venue: match.venue,
        status: match.status
      }))
    };
  }

  // High-performance team statistics using database aggregation
  async getTeamStatisticsOptimized(clubId, limit = 10) {
    try {
      // Use raw SQL query for maximum performance with complex aggregations
      const [results] = await sequelize.query(`
        WITH team_matches AS (
          SELECT
            m.id,
            m.match_date,
            m.home_score,
            m.away_score,
            m.home_club_id,
            m.away_club_id,
            CASE
              WHEN m.home_club_id = :clubId THEN 'home'
              ELSE 'away'
            END as team_side,
            CASE
              WHEN m.home_club_id = :clubId AND m.home_score > m.away_score THEN 'win'
              WHEN m.away_club_id = :clubId AND m.away_score > m.home_score THEN 'win'
              WHEN m.home_score = m.away_score THEN 'draw'
              ELSE 'loss'
            END as result,
            CASE
              WHEN m.home_club_id = :clubId THEN m.home_score
              ELSE m.away_score
            END as goals_for,
            CASE
              WHEN m.home_club_id = :clubId THEN m.away_score
              ELSE m.home_score
            END as goals_against,
            ms.home_shots,
            ms.away_shots,
            ms.home_shots_on_target,
            ms.away_shots_on_target,
            ms.home_possession,
            ms.away_possession,
            ms.home_fouls,
            ms.away_fouls,
            ms.home_yellow_cards,
            ms.away_yellow_cards,
            ms.home_red_cards,
            ms.away_red_cards
          FROM matches m
          LEFT JOIN match_statistics ms ON m.id = ms.match_id
          WHERE (m.home_club_id = :clubId OR m.away_club_id = :clubId)
            AND m.status = 'completed'
          ORDER BY m.match_date DESC
          LIMIT :limit
        )
        SELECT
          COUNT(*) as matches_played,
          SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) as wins,
          SUM(CASE WHEN result = 'draw' THEN 1 ELSE 0 END) as draws,
          SUM(CASE WHEN result = 'loss' THEN 1 ELSE 0 END) as losses,
          SUM(goals_for) as total_goals_for,
          SUM(goals_against) as total_goals_against,
          SUM(
            CASE
              WHEN team_side = 'home' THEN COALESCE(home_shots, 0)
              ELSE COALESCE(away_shots, 0)
            END
          ) as total_shots,
          SUM(
            CASE
              WHEN team_side = 'home' THEN COALESCE(home_shots_on_target, 0)
              ELSE COALESCE(away_shots_on_target, 0)
            END
          ) as total_shots_on_target,
          AVG(
            CASE
              WHEN team_side = 'home' AND home_possession IS NOT NULL THEN home_possession
              WHEN team_side = 'away' AND away_possession IS NOT NULL THEN away_possession
              ELSE NULL
            END
          ) as average_possession,
          SUM(
            CASE
              WHEN team_side = 'home' THEN COALESCE(home_fouls, 0)
              ELSE COALESCE(away_fouls, 0)
            END
          ) as total_fouls,
          SUM(
            CASE
              WHEN team_side = 'home' THEN COALESCE(home_yellow_cards, 0)
              ELSE COALESCE(away_yellow_cards, 0)
            END
          ) as total_yellow_cards,
          SUM(
            CASE
              WHEN team_side = 'home' THEN COALESCE(home_red_cards, 0)
              ELSE COALESCE(away_red_cards, 0)
            END
          ) as total_red_cards
        FROM team_matches;
      `, {
        replacements: {
          clubId: parseInt(clubId),
          limit: parseInt(limit)
        },
        type: sequelize.QueryTypes.SELECT
      });

      const stats = results[0];

      if (!stats || stats.matches_played === '0') {
        return {
          club_id: clubId,
          total_matches: 0,
          statistics: null
        };
      }

      // Get recent matches for additional context
      const recentMatches = await Match.findAll({
        where: {
          [Op.or]: [
            { home_club_id: clubId },
            { away_club_id: clubId }
          ],
          status: 'completed'
        },
        include: [
          {
            model: Club,
            as: 'homeClub',
            attributes: ['id', 'name']
          },
          {
            model: Club,
            as: 'awayClub',
            attributes: ['id', 'name']
          }
        ],
        order: [['match_date', 'DESC']],
        limit: parseInt(limit),
        attributes: ['id', 'match_date', 'home_score', 'away_score', 'venue', 'status']
      });

      return {
        club_id: clubId,
        statistics: {
          matches_played: parseInt(stats.matches_played),
          wins: parseInt(stats.wins),
          draws: parseInt(stats.draws),
          losses: parseInt(stats.losses),
          goals_for: parseInt(stats.total_goals_for),
          goals_against: parseInt(stats.total_goals_against),
          total_shots: parseInt(stats.total_shots),
          total_shots_on_target: parseInt(stats.total_shots_on_target),
          average_possession: stats.average_possession ?
            Math.round(parseFloat(stats.average_possession) * 100) / 100 : 0,
          total_fouls: parseInt(stats.total_fouls),
          total_yellow_cards: parseInt(stats.total_yellow_cards),
          total_red_cards: parseInt(stats.total_red_cards),
          goal_difference: parseInt(stats.total_goals_for) - parseInt(stats.total_goals_against),
          win_percentage: Math.round((parseInt(stats.wins) / parseInt(stats.matches_played)) * 10000) / 100,
          clean_sheets: 0 // Would require additional query to calculate properly
        },
        recent_matches: recentMatches
      };

    } catch (error) {
      // Fallback to the original method if raw query fails
      console.warn('Optimized query failed, falling back to ORM method:', error.message);
      return this.getTeamStatistics(clubId, limit);
    }
  }
}

module.exports = new MatchStatisticsService();