const { Match, MatchEvent, Club, User, Tournament, ClubMember } = require('../models');
const { Op } = require('sequelize');
const { log } = require('../config/logger');

const matchService = {
  async createMatch(matchData, creatorId) {
    try {
      // Validate clubs exist and user has permission
      const homeClub = await Club.findByPk(matchData.home_club_id);
      const awayClub = await Club.findByPk(matchData.away_club_id);

      if (!homeClub || !awayClub) {
        throw new Error('One or both clubs not found');
      }

      // Check if user is member of at least one club
      const membershipCheck = await ClubMember.findOne({
        where: {
          user_id: creatorId,
          club_id: {
            [Op.in]: [matchData.home_club_id, matchData.away_club_id]
          }
        }
      });

      if (!membershipCheck) {
        throw new Error('You must be a member of one of the clubs to create a match');
      }

      // Create match with creator
      const match = await Match.create({
        ...matchData,
        created_by: creatorId
      });

      // Return match with associations
      return await Match.findByPk(match.id, {
        include: [
          {
            model: Club,
            as: 'homeClub',
            attributes: ['id', 'name', 'description']
          },
          {
            model: Club,
            as: 'awayClub',
            attributes: ['id', 'name', 'description']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'user_id', 'name', 'email']
          },
          {
            model: Tournament,
            as: 'tournament',
            attributes: ['id', 'name', 'description'],
            required: false
          }
        ]
      });
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  },

  async getAllMatches({ page = 1, limit = 10, filters = {}, userId }) {
    try {
      const offset = (page - 1) * limit;
      const whereClause = {};
      const includeClause = [
        {
          model: Club,
          as: 'homeClub',
          attributes: ['id', 'name', 'description']
        },
        {
          model: Club,
          as: 'awayClub',
          attributes: ['id', 'name', 'description']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'user_id', 'name']
        },
        {
          model: Tournament,
          as: 'tournament',
          attributes: ['id', 'name'],
          required: false
        }
      ];

      // Apply filters
      if (filters.status) {
        whereClause.status = filters.status;
      }
      if (filters.match_type) {
        whereClause.match_type = filters.match_type;
      }
      if (filters.club_id) {
        whereClause[Op.or] = [
          { home_club_id: filters.club_id },
          { away_club_id: filters.club_id }
        ];
      }
      if (filters.tournament_id) {
        whereClause.tournament_id = filters.tournament_id;
      }
      if (filters.date_from && filters.date_to) {
        whereClause.match_date = {
          [Op.between]: [filters.date_from, filters.date_to]
        };
      }

      // Get user's club memberships for permission filtering
      const userClubs = await ClubMember.findAll({
        where: { user_id: userId },
        attributes: ['club_id']
      });
      const userClubIds = userClubs.map(membership => membership.club_id);

      // Only show matches where user is member of one of the clubs
      if (userClubIds.length > 0) {
        whereClause[Op.or] = [
          { home_club_id: { [Op.in]: userClubIds } },
          { away_club_id: { [Op.in]: userClubIds } },
          { created_by: userId }
        ];
      } else {
        // If user has no club memberships, only show matches they created
        whereClause.created_by = userId;
      }

      const { count, rows } = await Match.findAndCountAll({
        where: whereClause,
        include: includeClause,
        limit,
        offset,
        order: [['match_date', 'DESC']]
      });

      return {
        matches: rows,
        total: count
      };
    } catch (error) {
      throw error;
    }
  },

  async getMatchById(matchId, userId) {
    try {
      const match = await Match.findByPk(matchId, {
        include: [
          {
            model: Club,
            as: 'homeClub',
            attributes: ['id', 'name', 'description']
          },
          {
            model: Club,
            as: 'awayClub',
            attributes: ['id', 'name', 'description']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'user_id', 'name']
          },
          {
            model: Tournament,
            as: 'tournament',
            attributes: ['id', 'name', 'description'],
            required: false
          }
        ]
      });

      if (!match) {
        return null;
      }

      // Check permission - user must be member of one of the clubs or creator
      const membershipCheck = await ClubMember.findOne({
        where: {
          user_id: userId,
          club_id: {
            [Op.in]: [match.home_club_id, match.away_club_id]
          }
        }
      });

      if (!membershipCheck && match.created_by !== userId) {
        throw new Error('You do not have permission to view this match');
      }

      return match;
    } catch (error) {
      throw error;
    }
  },

  async updateMatch(matchId, updateData, userId) {
    try {
      const match = await Match.findByPk(matchId);

      if (!match) {
        throw new Error('Match not found');
      }

      // Check permission - user must be creator or admin of one of the clubs
      const isCreator = match.created_by === userId;
      const adminCheck = await ClubMember.findOne({
        where: {
          user_id: userId,
          club_id: {
            [Op.in]: [match.home_club_id, match.away_club_id]
          },
          role: {
            [Op.in]: ['admin', 'manager']
          }
        }
      });

      if (!isCreator && !adminCheck) {
        throw new Error('You do not have permission to update this match');
      }

      // Update match
      await match.update(updateData);

      // Return updated match with associations
      return await Match.findByPk(matchId, {
        include: [
          {
            model: Club,
            as: 'homeClub',
            attributes: ['id', 'name', 'description']
          },
          {
            model: Club,
            as: 'awayClub',
            attributes: ['id', 'name', 'description']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'user_id', 'name']
          },
          {
            model: Tournament,
            as: 'tournament',
            attributes: ['id', 'name'],
            required: false
          }
        ]
      });
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  },

  async deleteMatch(matchId, userId) {
    try {
      const match = await Match.findByPk(matchId);

      if (!match) {
        throw new Error('Match not found');
      }

      // Check permission - only creator or club admin can delete
      const isCreator = match.created_by === userId;
      const adminCheck = await ClubMember.findOne({
        where: {
          user_id: userId,
          club_id: {
            [Op.in]: [match.home_club_id, match.away_club_id]
          },
          role: {
            [Op.in]: ['admin', 'manager']
          }
        }
      });

      if (!isCreator && !adminCheck) {
        throw new Error('You do not have permission to delete this match');
      }

      // Delete associated events first
      await MatchEvent.destroy({
        where: { match_id: matchId }
      });

      // Delete match
      await match.destroy();

      return true;
    } catch (error) {
      throw error;
    }
  },

  async addMatchEvent(matchId, eventData, userId) {
    try {
      const match = await Match.findByPk(matchId);

      if (!match) {
        throw new Error('Match not found');
      }

      // Check permission - user must be member of one of the clubs
      const membershipCheck = await ClubMember.findOne({
        where: {
          user_id: userId,
          club_id: {
            [Op.in]: [match.home_club_id, match.away_club_id]
          }
        }
      });

      if (!membershipCheck && match.created_by !== userId) {
        throw new Error('You do not have permission to add events to this match');
      }

      // Get next sequence number
      const lastEvent = await MatchEvent.findOne({
        where: { match_id: matchId },
        order: [['sequence_number', 'DESC']]
      });

      const sequenceNumber = lastEvent ? lastEvent.sequence_number + 1 : 1;

      // Create event
      const event = await MatchEvent.create({
        match_id: matchId,
        ...eventData,
        sequence_number: sequenceNumber,
        recorded_by: userId
      });

      // Update match score if event is a goal
      if (eventData.event_type === 'GOAL') {
        const scoreUpdate = {};
        if (eventData.team_side === 'home') {
          scoreUpdate.home_score = match.home_score + 1;
        } else if (eventData.team_side === 'away') {
          scoreUpdate.away_score = match.away_score + 1;
        }
        await match.update(scoreUpdate);
      }

      // Return event with associations
      return await MatchEvent.findByPk(event.id, {
        include: [
          {
            model: User,
            as: 'player',
            attributes: ['id', 'user_id', 'name'],
            required: false
          },
          {
            model: User,
            as: 'relatedPlayer',
            attributes: ['id', 'user_id', 'name'],
            required: false
          },
          {
            model: User,
            as: 'recorder',
            attributes: ['id', 'user_id', 'name']
          }
        ]
      });
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  },

  async getMatchEvents(matchId, userId) {
    try {
      const match = await Match.findByPk(matchId);

      if (!match) {
        throw new Error('Match not found');
      }

      // Check permission - user must be member of one of the clubs or creator
      const membershipCheck = await ClubMember.findOne({
        where: {
          user_id: userId,
          club_id: {
            [Op.in]: [match.home_club_id, match.away_club_id]
          }
        }
      });

      if (!membershipCheck && match.created_by !== userId) {
        throw new Error('You do not have permission to view events for this match');
      }

      // Get events with associations
      const events = await MatchEvent.findAll({
        where: { match_id: matchId },
        include: [
          {
            model: User,
            as: 'player',
            attributes: ['id', 'user_id', 'name'],
            required: false
          },
          {
            model: User,
            as: 'relatedPlayer',
            attributes: ['id', 'user_id', 'name'],
            required: false
          },
          {
            model: User,
            as: 'recorder',
            attributes: ['id', 'user_id', 'name']
          }
        ],
        order: [['sequence_number', 'ASC']]
      });

      return events;
    } catch (error) {
      throw error;
    }
  },

  // Live scoring specific methods
  async startMatch(matchId, userId) {
    try {
      const match = await this.getMatchById(matchId, userId);

      if (!match) {
        throw new Error('Match not found');
      }

      if (match.status !== 'scheduled') {
        throw new Error('Match is not in scheduled status');
      }

      await match.update({ status: 'in_progress' });

      // Add match start event
      await this.addMatchEvent(matchId, {
        event_type: 'MATCH_START',
        minute: 0,
        description: 'Match started'
      }, userId);

      return await this.getMatchById(matchId, userId);
    } catch (error) {
      throw error;
    }
  },

  async endMatch(matchId, userId) {
    try {
      const match = await this.getMatchById(matchId, userId);

      if (!match) {
        throw new Error('Match not found');
      }

      if (match.status !== 'in_progress') {
        throw new Error('Match is not in progress');
      }

      await match.update({ status: 'completed' });

      // Add match end event
      await this.addMatchEvent(matchId, {
        event_type: 'MATCH_END',
        minute: match.duration_minutes || 90,
        description: 'Match completed'
      }, userId);

      return await this.getMatchById(matchId, userId);
    } catch (error) {
      throw error;
    }
  }
};

module.exports = matchService;