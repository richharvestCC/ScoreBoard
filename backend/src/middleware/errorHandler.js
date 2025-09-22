const { log } = require('../config/logger');

/**
 * Centralized error handling middleware for Express
 * Handles all application errors in a consistent format
 */
const errorHandler = (err, req, res, next) => {
  const { name, message } = err;
  let statusCode = err.statusCode || 500;

  // Map custom error types to HTTP status codes
  const errorTypeMap = {
    'NotFoundError': 404,
    'ValidationError': 400,
    'UnauthorizedError': 401,
    'ForbiddenError': 403,
    'ConflictError': 409,
    'SequelizeValidationError': 400,
    'SequelizeUniqueConstraintError': 409,
    'SequelizeForeignKeyConstraintError': 400
  };

  if (errorTypeMap[name]) {
    statusCode = errorTypeMap[name];
  }

  // Log error with context
  log.error('Request failed', {
    path: req.path,
    method: req.method,
    user: req.user?.id || 'anonymous',
    error: message,
    type: name,
    statusCode
  });

  // Send consistent error response
  res.status(statusCode).json({
    error: {
      name,
      message,
      type: name
    },
    success: false,
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;