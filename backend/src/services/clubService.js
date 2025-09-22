const { Club, User, ClubMember } = require('../models');
const { Op } = require('sequelize');
const { log } = require('../config/logger');

const clubService = {
  async createClub(clubData, creatorId) {
    try {
      // Create club
      const club = await Club.create(clubData);

      // Add creator as admin member
      await ClubMember.create({
        club_id: club.id,
        user_id: creatorId,
        role: 'admin',
        joined_date: new Date()
      });

      // Return club with creator info
      const clubWithCreator = await Club.findByPk(club.id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'user_id', 'name', 'email']
          }
        ]
      });

      return clubWithCreator;
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Club name already exists');
      }
      throw error;
    }
  },

  async getAllClubs({ page = 1, limit = 10, filters = {} }) {
    try {
      const offset = (page - 1) * limit;
      const whereClause = {};

      // Apply filters
      if (filters.is_active !== undefined) {
        whereClause.is_active = filters.is_active;
      }

      if (filters.search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${filters.search}%` } },
          { description: { [Op.iLike]: `%${filters.search}%` } },
          { location: { [Op.iLike]: `%${filters.search}%` } }
        ];
      }

      if (filters.location) {
        whereClause.location = { [Op.iLike]: `%${filters.location}%` };
      }

      const { count, rows } = await Club.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'user_id', 'name']
          },
          {
            model: User,
            as: 'members',
            through: {
              attributes: ['role', 'jersey_number', 'position', 'status']
            },
            attributes: ['id', 'user_id', 'name']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true
      });

      return {
        clubs: rows,
        total: count
      };
    } catch (error) {
      log.error('Error in getAllClubs service', { error: error.message });
      throw error;
    }
  },

  async getClubById(clubId) {
    try {
      const club = await Club.findByPk(clubId, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'user_id', 'name', 'email']
          },
          {
            model: User,
            as: 'members',
            through: {
              attributes: ['role', 'jersey_number', 'position', 'status', 'joined_date'],
              where: { is_active: true }
            },
            attributes: ['id', 'user_id', 'name', 'profile_image_url']
          }
        ]
      });

      return club;
    } catch (error) {
      log.error('Error in getClubById service', { error: error.message, clubId });
      throw error;
    }
  },

  async updateClub(clubId, updateData, userId) {
    try {
      const club = await Club.findByPk(clubId);

      if (!club) {
        throw new Error('Club not found');
      }

      // Check if user has permission (creator or admin member)
      const hasPermission = await this.checkClubPermission(clubId, userId, ['admin']);
      if (!hasPermission) {
        throw new Error('You do not have permission to update this club');
      }

      await club.update(updateData);

      // Return updated club with relations
      return await this.getClubById(clubId);
    } catch (error) {
      log.error('Error in updateClub service', { error: error.message, clubId, userId });
      throw error;
    }
  },

  async deleteClub(clubId, userId) {
    try {
      const club = await Club.findByPk(clubId);

      if (!club) {
        throw new Error('Club not found');
      }

      // Only creator can delete club
      if (club.created_by !== userId) {
        throw new Error('Only the club creator can delete the club');
      }

      // Soft delete - set is_active to false
      await club.update({ is_active: false });

      return true;
    } catch (error) {
      log.error('Error in deleteClub service', { error: error.message, clubId, userId });
      throw error;
    }
  },

  async joinClub(clubId, userId, membershipData) {
    try {
      const club = await Club.findByPk(clubId);

      if (!club) {
        throw new Error('Club not found');
      }

      if (!club.is_active) {
        throw new Error('Cannot join inactive club');
      }

      // Check if user is already a member
      const existingMembership = await ClubMember.findOne({
        where: {
          club_id: clubId,
          user_id: userId,
          is_active: true
        }
      });

      if (existingMembership) {
        throw new Error('User is already a member of this club');
      }

      // Check jersey number uniqueness if provided
      if (membershipData.jersey_number) {
        const existingJersey = await ClubMember.findOne({
          where: {
            club_id: clubId,
            jersey_number: membershipData.jersey_number,
            is_active: true
          }
        });

        if (existingJersey) {
          throw new Error(`Jersey number ${membershipData.jersey_number} is already taken`);
        }
      }

      const membership = await ClubMember.create({
        club_id: clubId,
        user_id: userId,
        ...membershipData
      });

      // Return membership with user and club info
      return await ClubMember.findByPk(membership.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'user_id', 'name', 'email']
          },
          {
            model: Club,
            as: 'club',
            attributes: ['id', 'name']
          }
        ]
      });
    } catch (error) {
      log.error('Error in joinClub service', { error: error.message, clubId, userId });
      throw error;
    }
  },

  async leaveClub(clubId, userId) {
    try {
      const membership = await ClubMember.findOne({
        where: {
          club_id: clubId,
          user_id: userId,
          is_active: true
        }
      });

      if (!membership) {
        throw new Error('User is not a member of this club');
      }

      // Soft delete membership
      await membership.update({
        is_active: false,
        left_date: new Date()
      });

      return true;
    } catch (error) {
      log.error('Error in leaveClub service', { error: error.message, clubId, userId });
      throw error;
    }
  },

  async getClubMembers(clubId, filters = {}) {
    try {
      const club = await Club.findByPk(clubId);

      if (!club) {
        throw new Error('Club not found');
      }

      const whereClause = {
        club_id: clubId,
        is_active: true
      };

      if (filters.role) {
        whereClause.role = filters.role;
      }

      if (filters.status) {
        whereClause.status = filters.status;
      }

      const members = await ClubMember.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'user_id', 'name', 'email', 'profile_image_url']
          }
        ],
        order: [['role', 'ASC'], ['jersey_number', 'ASC']]
      });

      return members;
    } catch (error) {
      log.error('Error in getClubMembers service', { error: error.message, clubId });
      throw error;
    }
  },

  async updateMember(clubId, memberId, updateData, requesterId) {
    try {
      // Check if requester has permission
      const hasPermission = await this.checkClubPermission(clubId, requesterId, ['admin']);
      if (!hasPermission) {
        throw new Error('You do not have permission to update club members');
      }

      const membership = await ClubMember.findOne({
        where: {
          id: memberId,
          club_id: clubId,
          is_active: true
        }
      });

      if (!membership) {
        throw new Error('Club member not found');
      }

      // Check jersey number uniqueness if being updated
      if (updateData.jersey_number && updateData.jersey_number !== membership.jersey_number) {
        const existingJersey = await ClubMember.findOne({
          where: {
            club_id: clubId,
            jersey_number: updateData.jersey_number,
            is_active: true,
            id: { [Op.ne]: memberId }
          }
        });

        if (existingJersey) {
          throw new Error(`Jersey number ${updateData.jersey_number} is already taken`);
        }
      }

      await membership.update(updateData);

      return await ClubMember.findByPk(membership.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'user_id', 'name', 'email']
          }
        ]
      });
    } catch (error) {
      log.error('Error in updateMember service', { error: error.message, clubId, memberId });
      throw error;
    }
  },

  async removeMember(clubId, memberId, requesterId) {
    try {
      // Check if requester has permission
      const hasPermission = await this.checkClubPermission(clubId, requesterId, ['admin']);
      if (!hasPermission) {
        throw new Error('You do not have permission to remove club members');
      }

      const membership = await ClubMember.findOne({
        where: {
          id: memberId,
          club_id: clubId,
          is_active: true
        }
      });

      if (!membership) {
        throw new Error('Club member not found');
      }

      // Cannot remove club creator
      const club = await Club.findByPk(clubId);
      if (club.created_by === membership.user_id) {
        throw new Error('Cannot remove club creator');
      }

      await membership.update({
        is_active: false,
        left_date: new Date()
      });

      return true;
    } catch (error) {
      log.error('Error in removeMember service', { error: error.message, clubId, memberId });
      throw error;
    }
  },

  async checkClubPermission(clubId, userId, requiredRoles = []) {
    try {
      // Check if user is club creator
      const club = await Club.findByPk(clubId);
      if (club && club.created_by === userId) {
        return true;
      }

      // Check membership role
      const membership = await ClubMember.findOne({
        where: {
          club_id: clubId,
          user_id: userId,
          is_active: true
        }
      });

      if (!membership) {
        return false;
      }

      if (requiredRoles.length === 0) {
        return true; // Any member
      }

      return requiredRoles.includes(membership.role);
    } catch (error) {
      log.error('Error in checkClubPermission service', { error: error.message, clubId, userId });
      return false;
    }
  }
};

module.exports = clubService;