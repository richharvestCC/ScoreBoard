const winston = require('winston');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Enhanced structured log format
const structuredFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'stack'] }),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, correlationId, userId, metadata }) => {
    const correlation = correlationId ? `[${correlationId.substr(0, 8)}]` : '';
    const user = userId ? `[user:${userId}]` : '';
    const meta = metadata && Object.keys(metadata).length > 0 ? ` | ${JSON.stringify(metadata)}` : '';
    return `${timestamp} [${level.toUpperCase()}]${correlation}${user}: ${stack || message}${meta}`;
  })
);

// Define log levels and colors
winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  debug: 'green'
});

// Create logger instance with enhanced configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: structuredFormat,
  defaultMeta: {
    service: 'scoreboard-api',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    hostname: require('os').hostname(),
    pid: process.pid
  },
  transports: [
    // Console transport with enhanced formatting
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        consoleFormat
      )
    })
  ]
});

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  const logDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs');

  // Error log file with enhanced structure
  logger.add(new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    maxsize: 10485760, // 10MB
    maxFiles: 10,
    format: structuredFormat
  }));

  // Combined log file
  logger.add(new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    maxsize: 10485760, // 10MB
    maxFiles: 10,
    format: structuredFormat
  }));

  // Security audit log
  logger.add(new winston.transports.File({
    filename: path.join(logDir, 'security.log'),
    level: 'warn',
    maxsize: 10485760, // 10MB
    maxFiles: 20,
    format: structuredFormat
  }));

  // Performance metrics log
  logger.add(new winston.transports.File({
    filename: path.join(logDir, 'performance.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    format: structuredFormat
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

// Context storage for request correlation using AsyncLocalStorage
const { AsyncLocalStorage } = require('async_hooks');
const contextStorage = new AsyncLocalStorage();

// Generate correlation ID for request tracking
function generateCorrelationId() {
  return uuidv4();
}

// Get current context
function getCurrentContext() {
  return contextStorage.getStore() || {};
}

// Set context for current async execution
function setContext(context) {
  const currentContext = getCurrentContext();
  const newContext = { ...currentContext, ...context };
  contextStorage.enterWith(newContext);
}

// Enhanced helper functions with context support
const log = {
  // Basic logging with context
  error: (message, meta = {}) => {
    const context = getCurrentContext();
    logger.error(message, { ...context, ...meta });
  },

  warn: (message, meta = {}) => {
    const context = getCurrentContext();
    logger.warn(message, { ...context, ...meta });
  },

  info: (message, meta = {}) => {
    const context = getCurrentContext();
    logger.info(message, { ...context, ...meta });
  },

  debug: (message, meta = {}) => {
    const context = getCurrentContext();
    logger.debug(message, { ...context, ...meta });
  },

  // Enhanced HTTP request logging
  request: (req, res, responseTime) => {
    const correlationId = req.correlationId || generateCorrelationId();
    const userId = req.user?.id;

    setContext({ correlationId, userId });

    const logData = {
      correlationId,
      userId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      contentLength: res.get('Content-Length'),
      referrer: req.get('Referrer'),
      requestId: req.id
    };

    if (res.statusCode >= 500) {
      logger.error('HTTP Server Error', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('HTTP Client Error', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  },

  // Enhanced database operation logging
  database: (operation, table, duration, error = null, queryDetails = {}) => {
    const context = getCurrentContext();
    const logData = {
      ...context,
      operation,
      table,
      duration: `${duration}ms`,
      category: 'database',
      ...queryDetails
    };

    if (error) {
      logger.error(`Database Error: ${operation} on ${table}`, {
        ...logData,
        error: error.message,
        stack: error.stack
      });
    } else {
      logger.debug(`Database Operation: ${operation} on ${table}`, logData);
    }
  },

  // Enhanced Socket.io event logging
  socket: (event, socketId, data = {}) => {
    const context = getCurrentContext();
    logger.info(`Socket Event: ${event}`, {
      ...context,
      socketId,
      event,
      category: 'websocket',
      timestamp: new Date().toISOString(),
      ...data
    });
  },

  // Security event logging
  security: (event, severity, details = {}) => {
    const context = getCurrentContext();
    const securityLog = {
      ...context,
      securityEvent: event,
      severity,
      category: 'security',
      timestamp: new Date().toISOString(),
      ...details
    };

    if (severity === 'critical' || severity === 'high') {
      logger.error(`Security Event: ${event}`, securityLog);
    } else {
      logger.warn(`Security Event: ${event}`, securityLog);
    }
  },

  // Performance monitoring
  performance: (operation, duration, metadata = {}) => {
    const context = getCurrentContext();
    const perfLog = {
      ...context,
      operation,
      duration: `${duration}ms`,
      category: 'performance',
      timestamp: new Date().toISOString(),
      ...metadata
    };

    if (duration > 5000) { // 5 seconds
      logger.warn(`Slow Operation: ${operation}`, perfLog);
    } else if (duration > 1000) { // 1 second
      logger.info(`Performance: ${operation}`, perfLog);
    } else {
      logger.debug(`Performance: ${operation}`, perfLog);
    }
  },

  // Business logic events
  business: (event, entity, details = {}) => {
    const context = getCurrentContext();
    logger.info(`Business Event: ${event}`, {
      ...context,
      businessEvent: event,
      entity,
      category: 'business',
      timestamp: new Date().toISOString(),
      ...details
    });
  },

  // API rate limiting events
  rateLimit: (ip, endpoint, limit, window) => {
    const context = getCurrentContext();
    logger.warn('Rate Limit Exceeded', {
      ...context,
      ip,
      endpoint,
      limit,
      window,
      category: 'rate-limit',
      timestamp: new Date().toISOString()
    });
  }
};

// Export enhanced logging utilities
module.exports = {
  logger,
  log,
  generateCorrelationId,
  getCurrentContext,
  setContext,

  // Middleware factory for request correlation
  correlationMiddleware: () => {
    return (req, res, next) => {
      req.correlationId = generateCorrelationId();
      const context = { correlationId: req.correlationId };
      contextStorage.run(context, () => {
        next();
      });
    };
  },

  // Performance timing utility function
  timeOperation: (operationName, fn) => {
    return async (...args) => {
      const start = Date.now();
      try {
        const result = await fn(...args);
        const duration = Date.now() - start;
        log.performance(operationName, duration, { success: true });
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        log.performance(operationName, duration, { success: false, error: error.message });
        throw error;
      }
    };
  },

  // Security event shortcuts
  security: {
    authFailure: (details) => log.security('authentication_failure', 'medium', details),
    authSuccess: (details) => log.security('authentication_success', 'low', details),
    unauthorized: (details) => log.security('unauthorized_access', 'medium', details),
    suspiciousActivity: (details) => log.security('suspicious_activity', 'high', details),
    dataAccess: (details) => log.security('sensitive_data_access', 'medium', details)
  }
};