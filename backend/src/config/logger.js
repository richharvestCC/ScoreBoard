const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
  })
);

// Define log levels and colors
winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  debug: 'green'
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'scoreboard-api' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    })
  ]
});

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  const logDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs');

  // Error log file
  logger.add(new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }));

  // Combined log file
  logger.add(new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }));
}

// Create logs directory if it doesn't exist
if (process.env.NODE_ENV === 'production') {
  const fs = require('fs');
  const logDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs');

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

// Helper functions for different log levels
const log = {
  error: (message, meta = {}) => logger.error(message, meta),
  warn: (message, meta = {}) => logger.warn(message, meta),
  info: (message, meta = {}) => logger.info(message, meta),
  debug: (message, meta = {}) => logger.debug(message, meta),

  // HTTP request logging
  request: (req, res, responseTime) => {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    };

    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  },

  // Database operation logging
  database: (operation, table, duration, error = null) => {
    const logData = {
      operation,
      table,
      duration: `${duration}ms`
    };

    if (error) {
      logger.error(`Database Error: ${operation} on ${table}`, { ...logData, error: error.message });
    } else {
      logger.debug(`Database Operation: ${operation} on ${table}`, logData);
    }
  },

  // Socket.io event logging
  socket: (event, socketId, data = {}) => {
    logger.info(`Socket Event: ${event}`, {
      socketId,
      event,
      ...data
    });
  }
};

module.exports = { logger, log };