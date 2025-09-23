const competitionService = require('../services/competitionService');
const Joi = require('joi');
const { log } = require('../config/logger');

// 입력 데이터 검증 스키마
const competitionSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  competition_type: Joi.string().valid('league', 'tournament', 'cup').required(),
  format: Joi.string().valid('round_robin', 'knockout', 'mixed', 'group_knockout').required(),
  has_group_stage: Joi.boolean().default(false),
  group_stage_format: Joi.string().valid('round_robin', 'single_elimination').allow(null),
  knockout_stage_format: Joi.string().valid('single_elimination', 'double_elimination').allow(null),
  level: Joi.string().valid('local', 'regional', 'national', 'international').default('local'),
  season: Joi.string().max(50).allow(null),
  start_date: Joi.date().allow(null),
  end_date: Joi.date().greater(Joi.ref('start_date')).allow(null),
  registration_start: Joi.date().allow(null),
  registration_end: Joi.date().greater(Joi.ref('registration_start')).allow(null),
  description: Joi.string().allow(null, ''),
  rules: Joi.string().allow(null, ''),
  max_participants: Joi.number().integer().min(2).max(128).allow(null),
  min_participants: Joi.number().integer().min(2).allow(null),
  entry_fee: Joi.number().min(0).allow(null),
  prize_description: Joi.string().allow(null, ''),
  venue_info: Joi.string().allow(null, ''),
  is_public: Joi.boolean().default(true),
  organization_id: Joi.number().integer().allow(null),
  admin_user_id: Joi.number().integer().allow(null)
});

const updateCompetitionSchema = competitionSchema.fork(['name', 'competition_type', 'format'], (schema) => schema.optional());

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid('draft', 'open_registration', 'registration_closed', 'in_progress', 'completed', 'cancelled'),
  competition_type: Joi.string().valid('league', 'tournament', 'cup'),
  level: Joi.string().valid('local', 'regional', 'national', 'international'),
  season: Joi.string(),
  search: Joi.string().max(100),
  includeTemplates: Joi.boolean().default(false)
});

class CompetitionController {
  /**
   * 모든 대회 조회
   * GET /api/competitions
   */
  async getAllCompetitions(req, res) {
    try {
      const { error, value } = querySchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          errors: error.details.map(detail => detail.message)
        });
      }

      const result = await competitionService.getAllCompetitions(value);

      res.json({
        success: true,
        data: result.competitions,
        pagination: result.pagination
      });
    } catch (error) {
      log.error('Error fetching competitions', { error: error.message, stack: error.stack });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 대회 템플릿 조회
   * GET /api/competitions/templates
   */
  async getTemplates(req, res) {
    try {
      const templates = await competitionService.getTemplates();

      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      log.error('Error fetching templates', { error: error.message, stack: error.stack });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 활성 대회 조회
   * GET /api/competitions/active
   */
  async getActiveCompetitions(req, res) {
    try {
      const competitions = await competitionService.getActiveCompetitions();

      res.json({
        success: true,
        data: competitions
      });
    } catch (error) {
      log.error('Error fetching active competitions', { error: error.message, stack: error.stack });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 사용자별 대회 조회
   * GET /api/competitions/my
   */
  async getUserCompetitions(req, res) {
    try {
      const userId = req.user.id;
      const role = req.query.role || 'all'; // all, admin, creator, managed

      const competitions = await competitionService.getUserCompetitions(userId, role);

      res.json({
        success: true,
        data: competitions
      });
    } catch (error) {
      log.error('Error fetching user competitions', { error: error.message, stack: error.stack });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 특정 대회 조회
   * GET /api/competitions/:id
   */
  async getCompetitionById(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid competition ID'
        });
      }

      const competition = await competitionService.getCompetitionById(id);

      res.json({
        success: true,
        data: competition
      });
    } catch (error) {
      if (error.message === 'Competition not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      log.error('Error fetching competition', { error: error.message, stack: error.stack });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 새 대회 생성
   * POST /api/competitions
   */
  async createCompetition(req, res) {
    try {
      const { error, value } = competitionSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const userId = req.user.id;
      const competition = await competitionService.createCompetition(value, userId);

      res.status(201).json({
        success: true,
        data: competition,
        message: 'Competition created successfully'
      });
    } catch (error) {
      log.error('Error creating competition', { error: error.message, stack: error.stack });

      if (error.message.includes('required') || error.message.includes('must be')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 템플릿으로부터 대회 생성
   * POST /api/competitions/from-template/:templateId
   */
  async createFromTemplate(req, res) {
    try {
      const templateId = parseInt(req.params.templateId);
      if (isNaN(templateId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid template ID'
        });
      }

      const { error, value } = competitionSchema.fork(['name'], (schema) => schema.required()).validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const userId = req.user.id;
      const competition = await competitionService.createFromTemplate(templateId, value, userId);

      res.status(201).json({
        success: true,
        data: competition,
        message: 'Competition created from template successfully'
      });
    } catch (error) {
      log.error('Error creating competition from template', { error: error.message, stack: error.stack });

      if (error.message === 'Template not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 대회 수정
   * PUT /api/competitions/:id
   */
  async updateCompetition(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid competition ID'
        });
      }

      const { error, value } = updateCompetitionSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const userId = req.user.id;
      const competition = await competitionService.updateCompetition(id, value, userId);

      res.json({
        success: true,
        data: competition,
        message: 'Competition updated successfully'
      });
    } catch (error) {
      log.error('Error updating competition', { error: error.message, stack: error.stack });

      if (error.message === 'Competition not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('Unauthorized') || error.message.includes('Cannot update')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 대회 삭제
   * DELETE /api/competitions/:id
   */
  async deleteCompetition(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid competition ID'
        });
      }

      const userId = req.user.id;
      await competitionService.deleteCompetition(id, userId);

      res.json({
        success: true,
        message: 'Competition deleted successfully'
      });
    } catch (error) {
      log.error('Error deleting competition', { error: error.message, stack: error.stack });

      if (error.message === 'Competition not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('Only the creator') || error.message.includes('Cannot delete')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 대회 상태 변경
   * PATCH /api/competitions/:id/status
   */
  async updateCompetitionStatus(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid competition ID'
        });
      }

      const { status } = req.body;
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const validStatuses = ['draft', 'open_registration', 'registration_closed', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status',
          validStatuses
        });
      }

      const userId = req.user.id;
      const competition = await competitionService.updateCompetitionStatus(id, status, userId);

      res.json({
        success: true,
        data: competition,
        message: `Competition status updated to ${status}`
      });
    } catch (error) {
      log.error('Error updating competition status', { error: error.message, stack: error.stack });

      if (error.message === 'Competition not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('Only the admin') || error.message.includes('Invalid status transition')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new CompetitionController();