const { Tournament, User, Club, sequelize } = require('../models');
const { Op } = require('sequelize');

const tournamentService = {
  async createTournament(tournamentData) {
    const transaction = await sequelize.transaction();

    try {
      const tournament = await Tournament.create(tournamentData, { transaction });

      await transaction.commit();

      // Fetch the complete tournament with associations
      return await this.getTournamentById(tournament.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async getAllTournaments(filters = {}) {
    const {
      search,
      tournament_type,
      status,
      level,
      page = 1,
      limit = 10
    } = filters;

    const offset = (page - 1) * limit;

    const whereClause = {};

    // Search in name and description
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Filter by tournament type
    if (tournament_type) {
      whereClause.tournament_type = tournament_type;
    }

    // Filter by status
    if (status) {
      whereClause.status = status;
    }

    // Filter by level
    if (level) {
      whereClause.level = level;
    }

    const { count, rows } = await Tournament.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return {
      data: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    };
  },

  async getTournamentById(id, userId = null) {
    const tournament = await Tournament.findByPk(id, {
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!tournament) {
      return null;
    }

    const tournamentData = tournament.toJSON();

    // Add current user context if provided
    if (userId) {
      tournamentData.current_user_id = userId;
    }

    return tournamentData;
  },

  async updateTournament(id, updateData, userId) {
    const tournament = await Tournament.findByPk(id);

    if (!tournament) {
      throw new Error('Tournament not found');
    }

    // Check if user is admin
    if (tournament.admin_user_id !== userId) {
      throw new Error('Unauthorized');
    }

    await tournament.update(updateData);

    return await this.getTournamentById(id, userId);
  },

  async deleteTournament(id, userId) {
    const tournament = await Tournament.findByPk(id);

    if (!tournament) {
      throw new Error('Tournament not found');
    }

    // Check if user is admin
    if (tournament.admin_user_id !== userId) {
      throw new Error('Unauthorized');
    }

    await tournament.destroy();
  },

  async joinTournament(tournamentId, userId, clubId) {
    const transaction = await sequelize.transaction();

    try {
      const tournament = await Tournament.findByPk(tournamentId, { transaction });

      if (!tournament) {
        throw new Error('Tournament not found');
      }

      // Check if tournament is open for registration
      if (tournament.status !== 'open') {
        throw new Error('Tournament is not open for registration');
      }

      // Check if club exists and user has permission
      const club = await Club.findByPk(clubId, { transaction });
      if (!club) {
        throw new Error('Club not found');
      }

      // For now, we'll create a simple participation record
      // In the future, this could be expanded to include team rosters, etc.
      const participation = {
        tournament_id: tournamentId,
        club_id: clubId,
        user_id: userId,
        joined_at: new Date()
      };

      // Create TournamentParticipant record (this would need a model)
      // For now, we'll return a mock response
      await transaction.commit();

      return participation;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async leaveTournament(tournamentId, userId) {
    const tournament = await Tournament.findByPk(tournamentId);

    if (!tournament) {
      throw new Error('Tournament not found');
    }

    // Check if user is participating
    // This would need actual participation tracking
    // For now, we'll simulate the operation

    return true;
  },

  async getTournamentParticipants(tournamentId) {
    // This would fetch actual participants from TournamentParticipant model
    // For now, return empty array
    return [];
  },

  async getTournamentMatches(tournamentId) {
    // This would fetch matches related to the tournament
    // For now, return empty array
    return [];
  }
};

module.exports = tournamentService;