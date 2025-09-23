const tournamentService = require('../services/tournamentService');
const tournamentBracketService = require('../services/tournamentBracketService');
const { log } = require('../config/logger');

const tournamentController = {
  // Create a new tournament
  async createTournament(req, res) {
    try {
      const userId = req.user.id;
      const tournamentData = { ...req.body, admin_user_id: userId };

      const tournament = await tournamentService.createTournament(tournamentData);

      res.status(201).json({
        success: true,
        message: 'Tournament created successfully',
        data: tournament
      });
    } catch (error) {
      log.error('Create tournament error', { error: error.message, userId: req.user?.id });
      res.status(500).json({
        success: false,
        message: 'Failed to create tournament',
        error: error.message
      });
    }
  },

  // Get all tournaments with optional filters
  async getAllTournaments(req, res) {
    try {
      const filters = {
        search: req.query.search,
        tournament_type: req.query.tournament_type,
        status: req.query.status,
        level: req.query.level,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };

      const result = await tournamentService.getAllTournaments(filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      log.error('Get tournaments error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tournaments',
        error: error.message
      });
    }
  },

  // Get tournament by ID
  async getTournamentById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const tournament = await tournamentService.getTournamentById(id, userId);

      if (!tournament) {
        return res.status(404).json({
          success: false,
          message: 'Tournament not found'
        });
      }

      res.json({
        success: true,
        data: tournament
      });
    } catch (error) {
      log.error('Get tournament error', { error: error.message, tournamentId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tournament',
        error: error.message
      });
    }
  },

  // Update tournament
  async updateTournament(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const tournament = await tournamentService.updateTournament(id, req.body, userId);

      res.json({
        success: true,
        message: 'Tournament updated successfully',
        data: tournament
      });
    } catch (error) {
      log.error('Update tournament error', { error: error.message, tournamentId: req.params.id, userId: req.user?.id });
      if (error.message === 'Tournament not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      if (error.message === 'Unauthorized') {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to update this tournament'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to update tournament',
        error: error.message
      });
    }
  },

  // Delete tournament
  async deleteTournament(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await tournamentService.deleteTournament(id, userId);

      res.json({
        success: true,
        message: 'Tournament deleted successfully'
      });
    } catch (error) {
      log.error('Delete tournament error', { error: error.message, tournamentId: req.params.id, userId: req.user?.id });
      if (error.message === 'Tournament not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      if (error.message === 'Unauthorized') {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to delete this tournament'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to delete tournament',
        error: error.message
      });
    }
  },

  // Join tournament
  async joinTournament(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { club_id } = req.body;

      const participation = await tournamentService.joinTournament(id, userId, club_id);

      res.status(201).json({
        success: true,
        message: 'Successfully joined tournament',
        data: participation
      });
    } catch (error) {
      log.error('Join tournament error', { error: error.message, tournamentId: req.params.id, userId: req.user?.id });
      if (error.message === 'Tournament not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      if (error.message === 'Already participating' || error.message === 'Tournament is not open for registration') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to join tournament',
        error: error.message
      });
    }
  },

  // Leave tournament
  async leaveTournament(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await tournamentService.leaveTournament(id, userId);

      res.json({
        success: true,
        message: 'Successfully left tournament'
      });
    } catch (error) {
      log.error('Leave tournament error', { error: error.message, tournamentId: req.params.id, userId: req.user?.id });
      if (error.message === 'Tournament not found' || error.message === 'Not participating in this tournament') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to leave tournament',
        error: error.message
      });
    }
  },

  // Get tournament participants
  async getTournamentParticipants(req, res) {
    try {
      const { id } = req.params;

      const participants = await tournamentService.getTournamentParticipants(id);

      res.json({
        success: true,
        data: participants
      });
    } catch (error) {
      log.error('Get tournament participants error', { error: error.message, tournamentId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tournament participants',
        error: error.message
      });
    }
  },

  // Get tournament matches
  async getTournamentMatches(req, res) {
    try {
      const { id } = req.params;

      const matches = await tournamentService.getTournamentMatches(id);

      res.json({
        success: true,
        data: matches
      });
    } catch (error) {
      log.error('Get tournament matches error', { error: error.message, tournamentId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tournament matches',
        error: error.message
      });
    }
  },

  // Generate tournament bracket
  async generateBracket(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await tournamentBracketService.generateBracket(id, userId);

      res.json({
        success: true,
        message: result.message,
        data: {
          totalMatches: result.totalMatches,
          rounds: result.rounds
        }
      });
    } catch (error) {
      log.error('Generate bracket error', { error: error.message, stack: error.stack });
      if (error.name === 'NotFoundError') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      if (error.name === 'ValidationError' || error.name === 'UnauthorizedError') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to generate bracket',
        error: error.message
      });
    }
  },

  // Get tournament bracket
  async getBracket(req, res) {
    try {
      const { id } = req.params;

      const bracket = await tournamentBracketService.getBracket(id);

      res.json({
        success: true,
        data: bracket
      });
    } catch (error) {
      log.error('Get bracket error', { error: error.message, stack: error.stack });
      if (error.name === 'NotFoundError') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to fetch bracket',
        error: error.message
      });
    }
  },

  // Update bracket match result
  async updateBracketMatch(req, res) {
    try {
      const { id, matchId } = req.params;
      const userId = req.user.id;

      const result = await tournamentBracketService.updateBracketMatch(matchId, userId);

      res.json({
        success: true,
        message: result.message,
        data: {
          winnerId: result.winnerId,
          nextMatchId: result.nextMatchId
        }
      });
    } catch (error) {
      log.error('Update bracket match error', { error: error.message, stack: error.stack });
      if (error.name === 'NotFoundError') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to update bracket match',
        error: error.message
      });
    }
  }
};

module.exports = tournamentController;