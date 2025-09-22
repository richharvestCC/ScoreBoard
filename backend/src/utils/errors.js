// Custom error classes for better error handling
const { log } = require('../config/logger');

class AppError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.field = field;
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.resource = resource;
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

class ConflictError extends AppError {
  constructor(message, resource = null) {
    super(message, 409, 'CONFLICT');
    this.resource = resource;
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR');
  }
}

class TournamentError extends AppError {
  constructor(message, type = 'TOURNAMENT_ERROR') {
    super(message, 400, type);
  }
}

class TournamentFullError extends TournamentError {
  constructor() {
    super('Tournament is full', 'TOURNAMENT_FULL');
    this.statusCode = 409;
  }
}

class TournamentClosedError extends TournamentError {
  constructor() {
    super('Tournament is not open for registration', 'TOURNAMENT_CLOSED');
    this.statusCode = 409;
  }
}

class AlreadyParticipatingError extends TournamentError {
  constructor() {
    super('Already participating in this tournament', 'ALREADY_PARTICIPATING');
    this.statusCode = 409;
  }
}

class NotParticipatingError extends TournamentError {
  constructor() {
    super('Not participating in this tournament', 'NOT_PARTICIPATING');
    this.statusCode = 404;
  }
}

class MatchError extends AppError {
  constructor(message, type = 'MATCH_ERROR') {
    super(message, 400, type);
  }
}

class InvalidMatchStateError extends MatchError {
  constructor(message) {
    super(message, 'INVALID_MATCH_STATE');
    this.statusCode = 409;
  }
}

class ClubError extends AppError {
  constructor(message, type = 'CLUB_ERROR') {
    super(message, 400, type);
  }
}

class AlreadyMemberError extends ClubError {
  constructor() {
    super('Already a member of this club', 'ALREADY_MEMBER');
    this.statusCode = 409;
  }
}

class NotMemberError extends ClubError {
  constructor() {
    super('Not a member of this club', 'NOT_MEMBER');
    this.statusCode = 404;
  }
}

// Error handler middleware
const errorHandler = (error, req, res, next) => {
  let { statusCode = 500, message, code } = error;

  // Handle Sequelize errors
  if (error.name === 'SequelizeValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = error.errors.map(err => err.message).join(', ');
  } else if (error.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    code = 'DUPLICATE_ENTRY';
    message = 'Duplicate entry: ' + error.errors.map(err => err.path).join(', ');
  } else if (error.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    code = 'FOREIGN_KEY_ERROR';
    message = 'Invalid reference to related resource';
  }

  // Log error for debugging
  if (statusCode >= 500) {
    log.error('Server Error:', { error: error.message, stack: error.stack });
  }

  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  DatabaseError,
  TournamentError,
  TournamentFullError,
  TournamentClosedError,
  AlreadyParticipatingError,
  NotParticipatingError,
  MatchError,
  InvalidMatchStateError,
  ClubError,
  AlreadyMemberError,
  NotMemberError,
  errorHandler
};