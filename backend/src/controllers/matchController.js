const matchService = require('../services/matchService');
const matchStatisticsService = require('../services/matchStatisticsService');
const { log } = require('../config/logger');

const matchController = {
  async createMatch(req, res) {
    try {
      const userId = req.user.id;
      const matchData = req.body;

      const match = await matchService.createMatch(matchData, userId);

      log.info('Match created successfully', { matchId: match.id, userId });

      res.status(201).json({
        success: true,
        message: 'Match created successfully',
        data: match
      });
    } catch (error) {
      log.error('Error creating match', { error: error.message, userId: req.user?.id });

      if (error.message.includes('permission') || error.message.includes('not found')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('Validation error')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async getAllMatches(req, res) {
    try {
      const { page = 1, limit = 10, ...filters } = req.query;
      const userId = req.user.id;

      const result = await matchService.getAllMatches({
        page: parseInt(page),
        limit: parseInt(limit),
        filters,
        userId
      });

      res.json({
        success: true,
        data: {
          matches: result.matches,
          pagination: {
            current_page: parseInt(page),
            per_page: parseInt(limit),
            total: result.total,
            total_pages: Math.ceil(result.total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      log.error('Error getting matches', { error: error.message, userId: req.user?.id });

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async getMatchById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const match = await matchService.getMatchById(id, userId);

      if (!match) {
        return res.status(404).json({
          success: false,
          message: 'Match not found'
        });
      }

      res.json({
        success: true,
        data: match
      });
    } catch (error) {
      log.error('Error getting match by ID', { error: error.message, matchId: req.params.id });

      if (error.message.includes('permission')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async updateMatch(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      const match = await matchService.updateMatch(id, updateData, userId);

      log.info('Match updated successfully', { matchId: id, userId });

      res.json({
        success: true,
        message: 'Match updated successfully',
        data: match
      });
    } catch (error) {
      log.error('Error updating match', { error: error.message, matchId: req.params.id });

      if (error.message.includes('permission') || error.message.includes('not found')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('Validation error')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async deleteMatch(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await matchService.deleteMatch(id, userId);

      log.info('Match deleted successfully', { matchId: id, userId });

      res.json({
        success: true,
        message: 'Match deleted successfully'
      });
    } catch (error) {
      log.error('Error deleting match', { error: error.message, matchId: req.params.id });

      if (error.message.includes('permission') || error.message.includes('not found')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async addMatchEvent(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const eventData = req.body;

      const event = await matchService.addMatchEvent(id, eventData, userId);

      log.info('Match event added successfully', { matchId: id, eventId: event.id, userId });

      res.status(201).json({
        success: true,
        message: 'Match event added successfully',
        data: event
      });
    } catch (error) {
      log.error('Error adding match event', { error: error.message, matchId: req.params.id });

      if (error.message.includes('permission') || error.message.includes('not found')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('Validation error')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async getMatchEvents(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const events = await matchService.getMatchEvents(id, userId);

      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      log.error('Error getting match events', { error: error.message, matchId: req.params.id });

      if (error.message.includes('permission') || error.message.includes('not found')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get match statistics
  async getMatchStatistics(req, res) {
    try {
      const { id } = req.params;

      const statistics = await matchStatisticsService.getStatistics(id);

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      log.error('Error getting match statistics', { error: error.message, matchId: req.params.id });

      if (error.name === 'NotFoundError') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to fetch match statistics'
      });
    }
  },

  // Update match statistics
  async updateMatchStatistics(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const statistics = req.body;

      const updatedStats = await matchStatisticsService.updateStatistics(id, statistics, userId);

      res.json({
        success: true,
        message: 'Statistics updated successfully',
        data: updatedStats
      });
    } catch (error) {
      log.error('Error updating match statistics', { error: error.message, matchId: req.params.id });

      if (error.name === 'NotFoundError') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.name === 'UnauthorizedError') {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update match statistics'
      });
    }
  },

  // Calculate statistics from events
  async calculateStatisticsFromEvents(req, res) {
    try {
      const { id } = req.params;

      const statistics = await matchStatisticsService.calculateFromEvents(id);

      res.json({
        success: true,
        message: 'Statistics calculated successfully',
        data: statistics
      });
    } catch (error) {
      log.error('Error calculating match statistics', { error: error.message, matchId: req.params.id });

      if (error.name === 'NotFoundError') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to calculate match statistics'
      });
    }
  }
};

module.exports = matchController;