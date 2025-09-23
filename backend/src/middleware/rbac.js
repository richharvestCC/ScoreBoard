const { log } = require('../config/logger');

/**
 * Role-Based Access Control (RBAC) Middleware
 */

/**
 * Check if user has required role
 * @param {string|Array} requiredRoles - Required role(s)
 * @returns {Function} Express middleware
 */
const requireRole = (requiredRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        log.security('unauthorized_access_attempt', req.correlationId, {
          endpoint: req.originalUrl,
          reason: 'no_user_context'
        });
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

      if (!req.user.hasAnyRole(roles)) {
        log.security('forbidden_access_attempt', req.correlationId, {
          userId: req.user.id,
          userRole: req.user.role,
          requiredRoles: roles,
          endpoint: req.originalUrl
        });
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      log.security('role_access_granted', req.correlationId, {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        endpoint: req.originalUrl
      });

      next();
    } catch (error) {
      log.error('Role check middleware error', req.correlationId, {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id,
        endpoint: req.originalUrl
      });
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

/**
 * Check if user has specific permission
 * @param {string} permission - Required permission
 * @returns {Function} Express middleware
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        log.security('unauthorized_access_attempt', req.correlationId, {
          endpoint: req.originalUrl,
          reason: 'no_user_context'
        });
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!req.user.hasPermission(permission)) {
        log.security('permission_denied', req.correlationId, {
          userId: req.user.id,
          userRole: req.user.role,
          requiredPermission: permission,
          endpoint: req.originalUrl
        });
        return res.status(403).json({
          success: false,
          message: `Permission denied: ${permission}`
        });
      }

      log.security('permission_granted', req.correlationId, {
        userId: req.user.id,
        userRole: req.user.role,
        permission: permission,
        endpoint: req.originalUrl
      });

      next();
    } catch (error) {
      log.error('Permission check middleware error', req.correlationId, {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id,
        endpoint: req.originalUrl
      });
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

/**
 * Check if user can manage specific resource
 * @param {string} resourceType - Type of resource (competition, tournament, etc.)
 * @param {string} resourceIdParam - Parameter name for resource ID
 * @returns {Function} Express middleware
 */
const requireResourceOwnership = (resourceType, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Admin can access everything
      if (req.user.hasRole('admin')) {
        return next();
      }

      const resourceId = req.params[resourceIdParam];
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'Resource ID required'
        });
      }

      // Load resource and check ownership based on type
      let canAccess = false;
      const models = require('../models');

      switch (resourceType) {
        case 'competition':
          const competition = await models.Competition.findByPk(resourceId);
          if (competition && req.user.canManageCompetition(competition)) {
            canAccess = true;
          }
          break;
        case 'club':
          const club = await models.Club.findByPk(resourceId);
          if (club && club.created_by === req.user.id) {
            canAccess = true;
          }
          break;
        default:
          log.warn('Unknown resource type for ownership check', req.correlationId, {
            resourceType,
            resourceId,
            userId: req.user.id
          });
      }

      if (!canAccess) {
        log.security('resource_access_denied', req.correlationId, {
          userId: req.user.id,
          userRole: req.user.role,
          resourceType,
          resourceId,
          endpoint: req.originalUrl
        });
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this resource'
        });
      }

      log.security('resource_access_granted', req.correlationId, {
        userId: req.user.id,
        userRole: req.user.role,
        resourceType,
        resourceId,
        endpoint: req.originalUrl
      });

      next();
    } catch (error) {
      log.error('Resource ownership check error', req.correlationId, {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id,
        resourceType,
        endpoint: req.originalUrl
      });
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

/**
 * Check if user account is active
 * @returns {Function} Express middleware
 */
const requireActiveAccount = () => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!req.user.is_active) {
        log.security('inactive_account_access_attempt', req.correlationId, {
          userId: req.user.id,
          endpoint: req.originalUrl
        });
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated. Please contact support.'
        });
      }

      next();
    } catch (error) {
      log.error('Active account check error', req.correlationId, {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id,
        endpoint: req.originalUrl
      });
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

/**
 * Predefined role combinations for common use cases
 */
const roles = {
  ADMIN_ONLY: requireRole('admin'),
  ADMIN_MODERATOR: requireRole(['admin', 'moderator']),
  ADMIN_MODERATOR_ORGANIZER: requireRole(['admin', 'moderator', 'organizer']),
  ALL_ROLES: requireRole(['admin', 'moderator', 'organizer', 'user'])
};

/**
 * Predefined permission checks
 */
const permissions = {
  MANAGE_USERS: requirePermission('manage_users'),
  CREATE_COMPETITION: requirePermission('create_competition'),
  MODERATE_CONTENT: requirePermission('moderate_content'),
  VIEW_ANALYTICS: requirePermission('view_analytics')
};

/**
 * Resource ownership checks
 */
const ownership = {
  COMPETITION: (resourceIdParam) => requireResourceOwnership('competition', resourceIdParam),
  CLUB: (resourceIdParam) => requireResourceOwnership('club', resourceIdParam)
};

module.exports = {
  requireRole,
  requirePermission,
  requireResourceOwnership,
  requireActiveAccount,
  roles,
  permissions,
  ownership
};