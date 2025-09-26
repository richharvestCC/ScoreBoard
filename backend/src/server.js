const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

// Import modules
const { testConnection, syncDatabase } = require('./models');
const routes = require('./routes/index');
const { logger, log, correlationMiddleware } = require('./config/logger');
const xssProtection = require('./middleware/xss-protection');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
    credentials: true
  }
});

// Live Socket Service
const liveSocketService = require('./services/liveSocketService');

// Security middleware
app.use(helmet());
app.use(xssProtection.securityHeaders);
app.use(xssProtection.requestValidation);
app.use(xssProtection.rateLimiting);

// Request correlation tracking (before morgan)
app.use(correlationMiddleware());

// Enhanced Morgan logging with structured output
app.use(morgan((tokens, req, res) => {
  const responseTime = tokens['response-time'](req, res);
  log.request(req, res, parseFloat(responseTime) || 0);
  return null; // Prevent default morgan output
}));

// CORS configuration
const corsOptions = {
  origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware with XSS protection
app.use(express.json(xssProtection.jsonParserLimits));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Make live socket service accessible to routes
app.use((req, res, next) => {
  req.liveSocketService = liveSocketService;
  next();
});

// Routes
app.use('/api/v1', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ScoreBoard API Server',
    version: '1.0.0',
    documentation: '/api/v1/health'
  });
});

// XSS error handler (before global error handler)
app.use(xssProtection.xssErrorHandler);

// Global error handler
app.use((error, req, res, next) => {
  log.error('Global error handler', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method
  });

  res.status(error.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// Initialize Live Socket Service
liveSocketService.initialize(server);

// Start server
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  let dbConnected = false;
  let dbConnectionResult = null;

  try {
    // Test database connection with enhanced retry logic and circuit breaker
    log.info('Attempting to establish database connection...');
    dbConnectionResult = await testConnection(3, 2000);
    dbConnected = true;

    log.info('Database connection established', {
      attempt: dbConnectionResult.attempt,
      duration: `${dbConnectionResult.duration}ms`
    });

    // Sync database models with enhanced error handling
    log.info('Synchronizing database models...');
    const syncResult = await syncDatabase();

    log.info('Database synchronization completed', {
      method: syncResult.method,
      duration: syncResult.duration ? `${syncResult.duration}ms` : 'N/A'
    });

  } catch (error) {
    log.error('Database connection failed during startup', {
      error: error.message,
      errorCode: error.code,
      errorErrno: error.errno,
      stack: error.stack
    });

    // Environment-specific failure handling
    const env = process.env.NODE_ENV || 'development';

    if (env === 'production') {
      log.error('Database is required in production mode. Server cannot start.', {
        environment: env,
        shutdownReason: 'database_connection_failed'
      });
      process.exit(1);
    } else {
      log.warn('Running in development mode without database', {
        environment: env,
        degradedMode: true,
        impact: 'Some features will be unavailable'
      });
      log.info('Development mode troubleshooting tips', {
        tips: [
          'Ensure PostgreSQL is running',
          'Check database configuration in config/database.js',
          'Verify database credentials',
          'Check if database exists'
        ]
      });
    }
  }

  try {
    // Start server regardless of database status
    server.listen(PORT, () => {
      log.info(`🚀 ScoreBoard API Server running on port ${PORT}`);
      log.info(`📍 Server URL: http://localhost:${PORT}`);
      log.info(`🔗 API Docs: http://localhost:${PORT}/api/v1/health`);
      log.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      log.info(`💾 Database Status: ${dbConnected ? '✅ Connected' : '❌ Disconnected'}`);

      // Set up enhanced database monitoring if initial connection failed
      if (!dbConnected) {
        const healthCheckTimer = setupDatabaseHealthCheck();

        // Store timer for graceful shutdown
        process.healthCheckTimer = healthCheckTimer;
      }
    });
  } catch (error) {
    log.error('❌ Failed to start HTTP server', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

// Enhanced database health monitoring with adaptive intervals
const setupDatabaseHealthCheck = () => {
  let healthCheckInterval = 30000; // Start with 30 seconds
  let consecutiveFailures = 0;
  let healthCheckTimer;

  const performHealthCheck = async () => {
    try {
      const { checkConnectionHealth, circuitBreaker } = require('./models');

      // Check circuit breaker status
      const circuitStatus = circuitBreaker.getStatus();
      log.debug('Circuit breaker status', circuitStatus);

      if (circuitStatus.state === 'OPEN') {
        log.warn('Circuit breaker is OPEN - skipping health check', {
          nextAttempt: circuitStatus.nextAttempt,
          failureCount: circuitStatus.failureCount
        });
        return;
      }

      const health = await checkConnectionHealth();

      if (health.healthy) {
        log.info('Database connection restored', {
          responseTime: `${health.responseTime}ms`,
          downtime: consecutiveFailures > 0 ? `${consecutiveFailures * healthCheckInterval}ms` : 'N/A'
        });

        // Reset failure counter and interval
        consecutiveFailures = 0;
        healthCheckInterval = 30000; // Reset to 30 seconds

        // Clear health check timer - database is back
        clearInterval(healthCheckTimer);
        log.info('Database health monitoring stopped - connection restored');

      } else {
        consecutiveFailures++;

        // Exponential backoff for health checks (max 5 minutes)
        healthCheckInterval = Math.min(
          healthCheckInterval * 1.5,
          300000 // 5 minutes max
        );

        log.warn('Database still unavailable', {
          error: health.error,
          errorType: health.errorType,
          consecutiveFailures,
          nextCheckIn: `${healthCheckInterval}ms`,
          troubleshooting: health.troubleshooting
        });

        // Restart timer with new interval
        clearInterval(healthCheckTimer);
        healthCheckTimer = setInterval(performHealthCheck, healthCheckInterval);
      }

    } catch (error) {
      log.error('Health check failed', {
        error: error.message,
        consecutiveFailures: ++consecutiveFailures
      });
    }
  };

  log.info('Starting database health monitoring', {
    initialInterval: `${healthCheckInterval}ms`
  });

  healthCheckTimer = setInterval(performHealthCheck, healthCheckInterval);

  // Store timer reference for cleanup
  return healthCheckTimer;
};

// Enhanced graceful shutdown handling
process.on('SIGTERM', async () => {
  log.info('SIGTERM received, initiating graceful shutdown');

  // Clear health check timer if running
  if (process.healthCheckTimer) {
    clearInterval(process.healthCheckTimer);
    log.info('Database health monitoring stopped');
  }

  // Close HTTP server
  server.close(async () => {
    log.info('HTTP server closed');

    // Close database connections
    try {
      const { sequelize } = require('./models');
      await sequelize.close();
      log.info('Database connections closed');
    } catch (error) {
      log.error('Error closing database connections', {
        error: error.message
      });
    }

    log.info('Graceful shutdown completed');
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    log.error('Forceful shutdown after timeout');
    process.exit(1);
  }, 10000);
});

process.on('SIGINT', async () => {
  log.info('SIGINT received, initiating graceful shutdown');

  // Clear health check timer if running
  if (process.healthCheckTimer) {
    clearInterval(process.healthCheckTimer);
    log.info('Database health monitoring stopped');
  }

  // Close HTTP server
  server.close(async () => {
    log.info('HTTP server closed');

    // Close database connections
    try {
      const { sequelize } = require('./models');
      await sequelize.close();
      log.info('Database connections closed');
    } catch (error) {
      log.error('Error closing database connections', {
        error: error.message
      });
    }

    log.info('Graceful shutdown completed');
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    log.error('Forceful shutdown after timeout');
    process.exit(1);
  }, 10000);
});

// Note: SIGINT handler is already defined above with enhanced shutdown logic

startServer();

module.exports = { app, server, io };