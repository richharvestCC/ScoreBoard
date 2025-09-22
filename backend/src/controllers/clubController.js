const { clubService } = require('../services');
const { log } = require('../config/logger');

const clubController = {
  // Create a new club
  async createClub(req, res) {
    try {
      const userId = req.user.id;
      const clubData = { ...req.body, created_by: userId };

      const club = await clubService.createClub(clubData, userId);

      log.info('Club created successfully', {
        clubId: club.id,
        clubName: club.name,
        createdBy: userId
      });

      res.status(201).json({
        success: true,
        message: 'Club created successfully',
        data: club
      });
    } catch (error) {
      log.error('Error creating club', {
        error: error.message,
        userId: req.user?.id,
        body: req.body
      });

      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get all clubs with pagination and filters
  async getAllClubs(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        location,
        is_active = true
      } = req.query;

      const filters = { is_active };
      if (search) filters.search = search;
      if (location) filters.location = location;

      const result = await clubService.getAllClubs({
        page: parseInt(page),
        limit: parseInt(limit),
        filters
      });

      res.json({
        success: true,
        data: result.clubs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    } catch (error) {
      log.error('Error fetching clubs', {
        error: error.message,
        query: req.query
      });

      res.status(500).json({
        success: false,
        message: 'Error fetching clubs'
      });
    }
  },

  // Get club by ID
  async getClubById(req, res) {
    try {
      const { id } = req.params;
      const club = await clubService.getClubById(id);

      if (!club) {
        return res.status(404).json({
          success: false,
          message: 'Club not found'
        });
      }

      res.json({
        success: true,
        data: club
      });
    } catch (error) {
      log.error('Error fetching club', {
        error: error.message,
        clubId: req.params.id
      });

      res.status(500).json({
        success: false,
        message: 'Error fetching club'
      });
    }
  },

  // Update club
  async updateClub(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const club = await clubService.updateClub(id, req.body, userId);

      log.info('Club updated successfully', {
        clubId: id,
        updatedBy: userId
      });

      res.json({
        success: true,
        message: 'Club updated successfully',
        data: club
      });
    } catch (error) {
      log.error('Error updating club', {
        error: error.message,
        clubId: req.params.id,
        userId: req.user?.id
      });

      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('permission') ? 403 : 400;

      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  },

  // Delete club
  async deleteClub(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await clubService.deleteClub(id, userId);

      log.info('Club deleted successfully', {
        clubId: id,
        deletedBy: userId
      });

      res.json({
        success: true,
        message: 'Club deleted successfully'
      });
    } catch (error) {
      log.error('Error deleting club', {
        error: error.message,
        clubId: req.params.id,
        userId: req.user?.id
      });

      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('permission') ? 403 : 400;

      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  },

  // Join club
  async joinClub(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { role = 'player', jersey_number, position } = req.body;

      const membership = await clubService.joinClub(id, userId, {
        role,
        jersey_number,
        position
      });

      log.info('User joined club successfully', {
        clubId: id,
        userId,
        role
      });

      res.status(201).json({
        success: true,
        message: 'Successfully joined club',
        data: membership
      });
    } catch (error) {
      log.error('Error joining club', {
        error: error.message,
        clubId: req.params.id,
        userId: req.user?.id
      });

      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('already') ? 409 : 400;

      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  },

  // Leave club
  async leaveClub(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await clubService.leaveClub(id, userId);

      log.info('User left club successfully', {
        clubId: id,
        userId
      });

      res.json({
        success: true,
        message: 'Successfully left club'
      });
    } catch (error) {
      log.error('Error leaving club', {
        error: error.message,
        clubId: req.params.id,
        userId: req.user?.id
      });

      const statusCode = error.message.includes('not found') ? 404 : 400;

      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get club members
  async getClubMembers(req, res) {
    try {
      const { id } = req.params;
      const { role, status = 'active' } = req.query;

      const filters = { status };
      if (role) filters.role = role;

      const members = await clubService.getClubMembers(id, filters);

      res.json({
        success: true,
        data: members
      });
    } catch (error) {
      log.error('Error fetching club members', {
        error: error.message,
        clubId: req.params.id
      });

      const statusCode = error.message.includes('not found') ? 404 : 500;

      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  },

  // Update member role/status
  async updateMember(req, res) {
    try {
      const { id, memberId } = req.params;
      const userId = req.user.id;

      const membership = await clubService.updateMember(id, memberId, req.body, userId);

      log.info('Club member updated successfully', {
        clubId: id,
        memberId,
        updatedBy: userId
      });

      res.json({
        success: true,
        message: 'Member updated successfully',
        data: membership
      });
    } catch (error) {
      log.error('Error updating club member', {
        error: error.message,
        clubId: req.params.id,
        memberId: req.params.memberId,
        userId: req.user?.id
      });

      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('permission') ? 403 : 400;

      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  },

  // Remove member from club
  async removeMember(req, res) {
    try {
      const { id, memberId } = req.params;
      const userId = req.user.id;

      await clubService.removeMember(id, memberId, userId);

      log.info('Club member removed successfully', {
        clubId: id,
        memberId,
        removedBy: userId
      });

      res.json({
        success: true,
        message: 'Member removed successfully'
      });
    } catch (error) {
      log.error('Error removing club member', {
        error: error.message,
        clubId: req.params.id,
        memberId: req.params.memberId,
        userId: req.user?.id
      });

      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('permission') ? 403 : 400;

      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = clubController;