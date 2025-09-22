import winston from 'winston';
import path from 'path';
import { Request, Response } from 'express';

// Define log levels type
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// Define log metadata interface
interface LogMetadata {
  [key: string]: any;
}

// HTTP request log data interface
interface HttpLogData {
  method: string;
  url: string;
  statusCode: number;
  responseTime: string;
  userAgent?: string;
  ip?: string;
}

// Database operation log data interface
interface DatabaseLogData {
  operation: string;
  table: string;
  duration: string;
  error?: string;
}

// Socket event log data interface
interface SocketLogData {
  socketId: string;
  event: string;
  [key: string]: any;
}

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

// Validate log level
function isValidLogLevel(level: string): level is LogLevel {
  return ['error', 'warn', 'info', 'debug'].includes(level);
}

// Get log level from environment or default to 'info'
function getLogLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL;
  if (envLevel && isValidLogLevel(envLevel)) {
    return envLevel;
  }
  return 'info';
}

// Create logger instance
const logger = winston.createLogger({
  level: getLogLevel(),
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

// Typed logger interface
interface TypedLogger {
  error: (message: string, meta?: LogMetadata) => void;
  warn: (message: string, meta?: LogMetadata) => void;
  info: (message: string, meta?: LogMetadata) => void;
  debug: (message: string, meta?: LogMetadata) => void;
  request: (req: Request, res: Response, responseTime: number) => void;
  database: (operation: string, table: string, duration: number, error?: Error) => void;
  socket: (event: string, socketId: string, data?: Record<string, any>) => void;
}

// Helper functions for different log levels with proper typing
const log: TypedLogger = {
  error: (message: string, meta: LogMetadata = {}) => logger.error(message, meta),
  warn: (message: string, meta: LogMetadata = {}) => logger.warn(message, meta),
  info: (message: string, meta: LogMetadata = {}) => logger.info(message, meta),
  debug: (message: string, meta: LogMetadata = {}) => logger.debug(message, meta),

  // HTTP request logging with typed data
  request: (req: Request, res: Response, responseTime: number) => {
    const logData: HttpLogData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection?.remoteAddress
    };

    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  },

  // Database operation logging with typed data
  database: (operation: string, table: string, duration: number, error?: Error) => {
    const logData: DatabaseLogData = {
      operation,
      table,
      duration: `${duration}ms`
    };

    if (error) {
      logger.error(`Database Error: ${operation} on ${table}`, {
        ...logData,
        error: error.message
      });
    } else {
      logger.debug(`Database Operation: ${operation} on ${table}`, logData);
    }
  },

  // Socket.io event logging with typed data
  socket: (event: string, socketId: string, data: Record<string, any> = {}) => {
    const logData: SocketLogData = {
      socketId,
      event,
      ...data
    };

    logger.info(`Socket Event: ${event}`, logData);
  }
};

// Enhanced logger with correlation ID support
interface CorrelatedLogger extends TypedLogger {
  withCorrelationId: (correlationId: string) => TypedLogger;
  setLogLevel: (level: LogLevel) => void;
  getCurrentLevel: () => LogLevel;
}

const enhancedLog: CorrelatedLogger = {
  ...log,

  // Create logger with correlation ID
  withCorrelationId: (correlationId: string): TypedLogger => {
    const correlationPrefix = correlationId.substring(0, 8); // Use substring instead of deprecated substr

    return {
      error: (message: string, meta: LogMetadata = {}) =>
        logger.error(`[${correlationPrefix}] ${message}`, meta),
      warn: (message: string, meta: LogMetadata = {}) =>
        logger.warn(`[${correlationPrefix}] ${message}`, meta),
      info: (message: string, meta: LogMetadata = {}) =>
        logger.info(`[${correlationPrefix}] ${message}`, meta),
      debug: (message: string, meta: LogMetadata = {}) =>
        logger.debug(`[${correlationPrefix}] ${message}`, meta),
      request: (req: Request, res: Response, responseTime: number) => {
        const logData: HttpLogData = {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          responseTime: `${responseTime}ms`,
          userAgent: req.get('User-Agent'),
          ip: req.ip || req.connection?.remoteAddress,
          correlationId: correlationPrefix
        };

        if (res.statusCode >= 400) {
          logger.warn(`[${correlationPrefix}] HTTP Request`, logData);
        } else {
          logger.info(`[${correlationPrefix}] HTTP Request`, logData);
        }
      },
      database: (operation: string, table: string, duration: number, error?: Error) => {
        const logData: DatabaseLogData = {
          operation,
          table,
          duration: `${duration}ms`,
          correlationId: correlationPrefix
        };

        if (error) {
          logger.error(`[${correlationPrefix}] Database Error: ${operation} on ${table}`, {
            ...logData,
            error: error.message
          });
        } else {
          logger.debug(`[${correlationPrefix}] Database Operation: ${operation} on ${table}`, logData);
        }
      },
      socket: (event: string, socketId: string, data: Record<string, any> = {}) => {
        const logData: SocketLogData = {
          socketId,
          event,
          correlationId: correlationPrefix,
          ...data
        };

        logger.info(`[${correlationPrefix}] Socket Event: ${event}`, logData);
      }
    };
  },

  // Set log level dynamically
  setLogLevel: (level: LogLevel) => {
    if (isValidLogLevel(level)) {
      logger.level = level;
    } else {
      logger.warn(`Invalid log level: ${level}. Using current level: ${logger.level}`);
    }
  },

  // Get current log level
  getCurrentLevel: (): LogLevel => {
    return logger.level as LogLevel;
  }
};

export { logger, log, enhancedLog, LogLevel, TypedLogger };
export type { LogMetadata, HttpLogData, DatabaseLogData, SocketLogData };