const { Tournament, TournamentParticipant, User, Club, sequelize } = require('../models');
const { Op } = require('sequelize');
const {
  NotFoundError,
  UnauthorizedError,
  TournamentFullError,
  TournamentClosedError,
  AlreadyParticipatingError,
  NotParticipatingError
} = require('../utils/errors');

class TournamentService {
  // Create a new tournament
  async createTournament(tournamentData, adminUserId) {
    const transaction = await sequelize.transaction();

    try {
      const tournament = await Tournament.create({
        ...tournamentData,
        admin_user_id: adminUserId
      }, { transaction });

      await transaction.commit();
      return tournament;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Get tournament by ID with participants
  async getTournamentById(id) {
    const tournament = await Tournament.findByPk(id, {
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'name', 'email']
        },
        {
          model: TournamentParticipant,
          as: 'participants',
          include: [
            {
              model: Tournament,
              as: 'tournament',
              attributes: []
            }
          ]
        }
      ]
    });

    if (!tournament) {
      throw new NotFoundError('Tournament');
    }

    // Get participant details (users and clubs)
    const participantIds = tournament.participants.map(p => ({
      id: p.participant_id,
      type: p.participant_type
    }));

    const userIds = participantIds.filter(p => p.type === 'user').map(p => p.id);
    const clubIds = participantIds.filter(p => p.type === 'club').map(p => p.id);

    const [users, clubs] = await Promise.all([
      userIds.length > 0 ? User.findAll({
        where: { id: userIds },
        attributes: ['id', 'name', 'email']
      }) : [],
      clubIds.length > 0 ? Club.findAll({
        where: { id: clubIds },
        attributes: ['id', 'name', 'description']
      }) : []
    ]);

    // Merge participant data
    tournament.participants = tournament.participants.map(participant => {
      const isUser = participant.participant_type === 'user';
      const details = isUser
        ? users.find(u => u.id === participant.participant_id)
        : clubs.find(c => c.id === participant.participant_id);

      return {
        ...participant.toJSON(),
        details: details || null
      };
    });

    return tournament;
  }

  // Get all tournaments with filtering
  async getAllTournaments(filters = {}) {
    const {
      search,
      tournament_type,
      status,
      level,
      page = 1,
      limit = 10
    } = filters;

    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (tournament_type) {
      where.tournament_type = tournament_type;
    }

    if (status) {
      where.status = status;
    }

    if (level) {
      where.level = level;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Tournament.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'name']
        },
        {
          model: TournamentParticipant,
          as: 'participants',
          attributes: ['id', 'participant_type', 'status']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return {
      tournaments: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  // Update tournament
  async updateTournament(id, updateData, userId) {
    const tournament = await Tournament.findByPk(id);

    if (!tournament) {
      throw new NotFoundError('Tournament');
    }

    // Check if user is admin
    if (tournament.admin_user_id !== userId) {
      throw new UnauthorizedError('Only tournament admin can update');
    }

    await tournament.update(updateData);
    return tournament;
  }

  // Delete tournament
  async deleteTournament(id, userId) {
    const tournament = await Tournament.findByPk(id);

    if (!tournament) {
      throw new NotFoundError('Tournament');
    }

    // Check if user is admin
    if (tournament.admin_user_id !== userId) {
      throw new UnauthorizedError('Only tournament admin can delete');
    }

    await tournament.destroy();
    return { message: 'Tournament deleted successfully' };
  }

  // Join tournament
  async joinTournament(tournamentId, participantData, userId) {
    const transaction = await sequelize.transaction();

    try {
      const tournament = await Tournament.findByPk(tournamentId);

      if (!tournament) {
        throw new NotFoundError('Tournament');
      }

      if (tournament.status !== 'open') {
        throw new TournamentClosedError();
      }

      // Check if tournament is full
      if (tournament.max_participants) {
        const currentParticipants = await TournamentParticipant.count({
          where: {
            tournament_id: tournamentId,
            status: 'active'
          }
        });

        if (currentParticipants >= tournament.max_participants) {
          throw new TournamentFullError();
        }
      }

      // Check if already participating
      const existingParticipant = await TournamentParticipant.findOne({
        where: {
          tournament_id: tournamentId,
          participant_id: participantData.participant_id || userId,
          participant_type: participantData.participant_type || 'user'
        }
      });

      if (existingParticipant) {
        throw new AlreadyParticipatingError();
      }

      const participant = await TournamentParticipant.create({
        tournament_id: tournamentId,
        participant_id: participantData.participant_id || userId,
        participant_type: participantData.participant_type || 'user',
        group_name: participantData.group_name || null,
        seed_number: participantData.seed_number || null
      }, { transaction });

      await transaction.commit();
      return participant;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Leave tournament
  async leaveTournament(tournamentId, userId, participantType = 'user', participantId = null) {
    const targetParticipantId = participantId || userId;

    const participant = await TournamentParticipant.findOne({
      where: {
        tournament_id: tournamentId,
        participant_id: targetParticipantId,
        participant_type: participantType
      }
    });

    if (!participant) {
      throw new NotParticipatingError();
    }

    await participant.destroy();
    return { message: 'Successfully left tournament' };
  }

  // Get tournament participants
  async getTournamentParticipants(tournamentId, filters = {}) {
    const {
      group_name,
      status = 'active',
      page = 1,
      limit = 50
    } = filters;

    const where = {
      tournament_id: tournamentId,
      status
    };

    if (group_name) {
      where.group_name = group_name;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await TournamentParticipant.findAndCountAll({
      where,
      order: [
        ['points', 'DESC'],
        ['goal_difference', 'DESC'],
        ['goals_for', 'DESC']
      ],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Get participant details
    const participantIds = rows.map(p => ({
      id: p.participant_id,
      type: p.participant_type
    }));

    const userIds = participantIds.filter(p => p.type === 'user').map(p => p.id);
    const clubIds = participantIds.filter(p => p.type === 'club').map(p => p.id);

    const [users, clubs] = await Promise.all([
      userIds.length > 0 ? User.findAll({
        where: { id: userIds },
        attributes: ['id', 'name', 'email']
      }) : [],
      clubIds.length > 0 ? Club.findAll({
        where: { id: clubIds },
        attributes: ['id', 'name', 'description']
      }) : []
    ]);

    // Merge participant data
    const participantsWithDetails = rows.map(participant => {
      const isUser = participant.participant_type === 'user';
      const details = isUser
        ? users.find(u => u.id === participant.participant_id)
        : clubs.find(c => c.id === participant.participant_id);

      return {
        ...participant.toJSON(),
        details: details || null
      };
    });

    return {
      participants: participantsWithDetails,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  // Update participant standings (for league tournaments)
  async updateParticipantStandings(tournamentId, participantId, participantType, stats) {
    const participant = await TournamentParticipant.findOne({
      where: {
        tournament_id: tournamentId,
        participant_id: participantId,
        participant_type: participantType
      }
    });

    if (!participant) {
      throw new NotFoundError('Participant');
    }

    await participant.update(stats);
    return participant;
  }
}

module.exports = new TournamentService();