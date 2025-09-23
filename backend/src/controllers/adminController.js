const { log } = require('../config/logger');
const { Op } = require('sequelize');
const User = require('../models/User');
const Competition = require('../models/Competition');
const Club = require('../models/Club');
const Match = require('../models/Match');
const Joi = require('joi');

// 사용자 관리 스키마
const userUpdateSchema = Joi.object({
  role: Joi.string().valid('user', 'admin', 'moderator', 'organizer'),
  is_active: Joi.boolean(),
  permissions: Joi.object().pattern(Joi.string(), Joi.boolean())
});

const userFilterSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  role: Joi.string().valid('user', 'admin', 'moderator', 'organizer'),
  is_active: Joi.boolean(),
  search: Joi.string().max(100),
  sort_by: Joi.string().valid('createdAt', 'name', 'email', 'last_login_at').default('createdAt'),
  sort_order: Joi.string().valid('ASC', 'DESC').default('DESC')
});

class AdminController {
  /**
   * 대시보드 통계 조회
   * GET /api/v1/admin/dashboard/stats
   */
  async getDashboardStats(req, res) {
    try {
      log.info('Fetching dashboard statistics', req.correlationId, {
        adminId: req.user.id
      });

      const [
        totalUsers,
        activeUsers,
        totalCompetitions,
        activeCompetitions,
        totalClubs,
        totalMatches,
        recentUsers,
        recentCompetitions
      ] = await Promise.all([
        // 전체 사용자 수
        User.count(),

        // 활성 사용자 수 (최근 30일 로그인)
        User.count({
          where: {
            is_active: true,
            last_login_at: {
              [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }),

        // 전체 대회 수
        Competition.count(),

        // 활성 대회 수
        Competition.count({
          where: {
            status: ['open_registration', 'registration_closed', 'in_progress']
          }
        }),

        // 전체 클럽 수
        Club.count(),

        // 전체 경기 수
        Match.count(),

        // 최근 가입 사용자 (최근 7일)
        User.count({
          where: {
            createdAt: {
              [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        }),

        // 최근 생성 대회 (최근 7일)
        Competition.count({
          where: {
            createdAt: {
              [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]);

      // 역할별 사용자 통계
      const roleStats = await User.findAll({
        attributes: [
          'role',
          [require('sequelize').fn('COUNT', require('sequelize').col('role')), 'count']
        ],
        group: ['role']
      });

      // 상태별 대회 통계
      const competitionStatusStats = await Competition.findAll({
        attributes: [
          'status',
          [require('sequelize').fn('COUNT', require('sequelize').col('status')), 'count']
        ],
        group: ['status']
      });

      const stats = {
        users: {
          total: totalUsers,
          active: activeUsers,
          recent: recentUsers,
          byRole: roleStats.reduce((acc, item) => {
            acc[item.role] = parseInt(item.get('count'));
            return acc;
          }, {})
        },
        competitions: {
          total: totalCompetitions,
          active: activeCompetitions,
          recent: recentCompetitions,
          byStatus: competitionStatusStats.reduce((acc, item) => {
            acc[item.status] = parseInt(item.get('count'));
            return acc;
          }, {})
        },
        clubs: {
          total: totalClubs
        },
        matches: {
          total: totalMatches
        }
      };

      log.info('Dashboard statistics retrieved', req.correlationId, {
        adminId: req.user.id,
        stats: {
          totalUsers,
          totalCompetitions,
          totalClubs,
          totalMatches
        }
      });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      log.error('Error fetching dashboard statistics', req.correlationId, {
        error: error.message,
        stack: error.stack,
        adminId: req.user.id
      });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 모든 사용자 조회 (필터링, 페이지네이션)
   * GET /api/v1/admin/users
   */
  async getAllUsers(req, res) {
    try {
      const { error, value } = userFilterSchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          errors: error.details.map(detail => detail.message)
        });
      }

      const {
        page,
        limit,
        role,
        is_active,
        search,
        sort_by,
        sort_order
      } = value;

      const offset = (page - 1) * limit;
      const where = {};

      // 필터 적용
      if (role) where.role = role;
      if (is_active !== undefined) where.is_active = is_active;

      // 검색 조건
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { user_id: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows } = await User.findAndCountAll({
        where,
        limit,
        offset,
        order: [[sort_by, sort_order]],
        attributes: { exclude: ['password_hash'] }
      });

      log.info('Users retrieved by admin', req.correlationId, {
        adminId: req.user.id,
        filters: { role, is_active, search },
        totalFound: count,
        page,
        limit
      });

      res.json({
        success: true,
        data: {
          users: rows,
          pagination: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      log.error('Error fetching users', req.correlationId, {
        error: error.message,
        stack: error.stack,
        adminId: req.user.id
      });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 특정 사용자 조회
   * GET /api/v1/admin/users/:id
   */
  async getUserById(req, res) {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
      }

      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password_hash'] },
        include: [
          {
            model: Competition,
            as: 'adminCompetitions',
            attributes: ['id', 'name', 'status']
          },
          {
            model: Competition,
            as: 'createdCompetitions',
            attributes: ['id', 'name', 'status']
          },
          {
            model: Club,
            as: 'createdClubs',
            attributes: ['id', 'name', 'club_type']
          }
        ]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      log.info('User details retrieved by admin', req.correlationId, {
        adminId: req.user.id,
        targetUserId: userId
      });

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      log.error('Error fetching user details', req.correlationId, {
        error: error.message,
        stack: error.stack,
        adminId: req.user.id,
        targetUserId: req.params.id
      });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 사용자 정보 수정
   * PUT /api/v1/admin/users/:id
   */
  async updateUser(req, res) {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
      }

      const { error, value } = userUpdateSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // 자기 자신의 관리자 권한은 제거할 수 없음
      if (userId === req.user.id && value.role && value.role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Cannot change your own admin role'
        });
      }

      // 자기 자신을 비활성화할 수 없음
      if (userId === req.user.id && value.is_active === false) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate your own account'
        });
      }

      const oldRole = user.role;
      const oldStatus = user.is_active;

      await user.update(value);

      log.security('user_updated_by_admin', req.correlationId, {
        adminId: req.user.id,
        targetUserId: userId,
        changes: {
          role: oldRole !== user.role ? { from: oldRole, to: user.role } : undefined,
          is_active: oldStatus !== user.is_active ? { from: oldStatus, to: user.is_active } : undefined
        }
      });

      res.json({
        success: true,
        data: user,
        message: 'User updated successfully'
      });
    } catch (error) {
      log.error('Error updating user', req.correlationId, {
        error: error.message,
        stack: error.stack,
        adminId: req.user.id,
        targetUserId: req.params.id
      });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 사용자 활동 로그 조회
   * GET /api/v1/admin/users/:id/activity
   */
  async getUserActivity(req, res) {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // 사용자 활동 통계
      const [
        competitionsCreated,
        competitionsManaged,
        clubsCreated,
        matchesRecorded
      ] = await Promise.all([
        Competition.count({ where: { created_by: userId } }),
        Competition.count({ where: { admin_user_id: userId } }),
        Club.count({ where: { created_by: userId } }),
        require('../models').MatchEvent ?
          require('../models').MatchEvent.count({ where: { recorded_by: userId } }) : 0
      ]);

      const activity = {
        competitions_created: competitionsCreated,
        competitions_managed: competitionsManaged,
        clubs_created: clubsCreated,
        matches_recorded: matchesRecorded,
        last_login: user.last_login_at,
        account_created: user.createdAt,
        account_updated: user.updatedAt
      };

      log.info('User activity retrieved by admin', req.correlationId, {
        adminId: req.user.id,
        targetUserId: userId
      });

      res.json({
        success: true,
        data: activity
      });
    } catch (error) {
      log.error('Error fetching user activity', req.correlationId, {
        error: error.message,
        stack: error.stack,
        adminId: req.user.id,
        targetUserId: req.params.id
      });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 시스템 상태 조회
   * GET /api/v1/admin/system/status
   */
  async getSystemStatus(req, res) {
    try {
      const { checkConnectionHealth } = require('../models');

      const dbHealth = await checkConnectionHealth();
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();

      const status = {
        database: {
          status: dbHealth.healthy ? 'healthy' : 'unhealthy',
          response_time: dbHealth.responseTime,
          error: dbHealth.error
        },
        server: {
          status: 'healthy',
          uptime: Math.floor(uptime),
          memory: {
            used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            external: Math.round(memoryUsage.external / 1024 / 1024)
          },
          node_version: process.version,
          environment: process.env.NODE_ENV
        },
        timestamp: new Date().toISOString()
      };

      log.info('System status checked by admin', req.correlationId, {
        adminId: req.user.id,
        status: status.database.status
      });

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      log.error('Error checking system status', req.correlationId, {
        error: error.message,
        stack: error.stack,
        adminId: req.user.id
      });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new AdminController();