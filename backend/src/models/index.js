'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const { log } = require('../config/logger');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/database.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Enhanced database connection testing with exponential backoff
db.testConnection = async (retries = 3, initialDelay = 2000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const startTime = Date.now();

    try {
      await sequelize.authenticate();
      const duration = Date.now() - startTime;

      log.info('Database connection established successfully', {
        attempt,
        retries,
        duration: `${duration}ms`,
        database: config.database,
        host: config.host,
        port: config.port
      });

      return { success: true, attempt, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorType = db.categorizeConnectionError(error);

      log.error(`Database connection attempt ${attempt}/${retries} failed`, {
        attempt,
        retries,
        duration: `${duration}ms`,
        errorType,
        errorCode: error.code,
        errorErrno: error.errno,
        errorMessage: error.message,
        database: config.database,
        host: config.host,
        port: config.port
      });

      if (attempt === retries) {
        log.error('All database connection attempts failed', {
          totalRetries: retries,
          finalError: error.message,
          errorType,
          troubleshooting: db.getTroubleshootingHints(errorType)
        });
        throw new Error(`Database connection failed after ${retries} attempts: ${error.message}`);
      }

      // Exponential backoff: 2s, 4s, 8s, etc.
      const delay = initialDelay * Math.pow(2, attempt - 1);
      log.info(`Retrying database connection`, {
        nextAttempt: attempt + 1,
        retryDelay: `${delay}ms`,
        remainingAttempts: retries - attempt
      });

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Comprehensive connection health check
db.checkConnectionHealth = async () => {
  const startTime = Date.now();

  try {
    // Basic authentication test
    await sequelize.authenticate();

    // Test actual query execution
    const [results] = await sequelize.query('SELECT 1 as test');

    const duration = Date.now() - startTime;

    const health = {
      healthy: true,
      responseTime: duration,
      database: config.database,
      host: config.host,
      port: config.port,
      timestamp: new Date().toISOString(),
      queryTest: results[0]?.test === 1
    };

    log.debug('Database health check passed', health);
    return health;

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorType = db.categorizeConnectionError(error);

    const health = {
      healthy: false,
      error: error.message,
      errorType,
      errorCode: error.code,
      responseTime: duration,
      database: config.database,
      host: config.host,
      port: config.port,
      timestamp: new Date().toISOString(),
      troubleshooting: db.getTroubleshootingHints(errorType)
    };

    log.warn('Database health check failed', health);
    return health;
  }
};

// Enhanced database synchronization with migration awareness
db.syncDatabase = async () => {
  const env = process.env.NODE_ENV || 'development';
  const startTime = Date.now();

  try {
    log.info('Starting database synchronization', {
      environment: env,
      database: config.database
    });

    if (env === 'production') {
      log.warn('Production mode detected - automatic sync disabled for safety');
      log.info('Please use migrations for schema changes in production');
      return { success: true, method: 'migration-required', duration: 0 };
    }

    // Check if migrations exist and should be preferred
    const migrationsExist = await db.checkMigrationsExist();

    if (migrationsExist) {
      log.info('Migrations detected - using migration-based approach');
      return { success: true, method: 'migrations-preferred', duration: 0 };
    }

    // In development, use sync with safety measures
    log.info('Running development database sync (alter: false for safety)');
    await sequelize.sync({ alter: false, force: false });

    const duration = Date.now() - startTime;

    log.info('Database synchronized successfully', {
      method: 'sync',
      duration: `${duration}ms`,
      environment: env
    });

    return { success: true, method: 'sync', duration };

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorType = db.categorizeConnectionError(error);

    log.error('Database synchronization failed', {
      error: error.message,
      errorType,
      duration: `${duration}ms`,
      environment: env,
      stack: error.stack
    });

    throw new Error(`Database synchronization failed: ${error.message}`);
  }
};

// Check if migrations directory exists
db.checkMigrationsExist = async () => {
  try {
    const migrationsPath = path.resolve(__dirname, '../../migrations');
    if (!fs.existsSync(migrationsPath)) {
      return false;
    }

    const files = fs.readdirSync(migrationsPath);
    const migrationFiles = files.filter(file => file.endsWith('.js'));

    log.debug('Migration check completed', {
      migrationsPath,
      migrationFiles: migrationFiles.length,
      files: migrationFiles
    });

    return migrationFiles.length > 0;
  } catch (error) {
    log.warn('Could not check migrations directory', {
      error: error.message
    });
    return false;
  }
};

// Error categorization for better troubleshooting
db.categorizeConnectionError = (error) => {
  const errorMessage = error.message.toLowerCase();
  const errorCode = error.code;

  if (errorCode === 'ECONNREFUSED' || errorMessage.includes('connection refused')) {
    return 'CONNECTION_REFUSED';
  }
  if (errorCode === 'ENOTFOUND' || errorMessage.includes('getaddrinfo')) {
    return 'DNS_RESOLUTION';
  }
  if (errorCode === 'ETIMEDOUT' || errorMessage.includes('timeout')) {
    return 'TIMEOUT';
  }
  if (errorMessage.includes('authentication') || errorMessage.includes('password')) {
    return 'AUTHENTICATION';
  }
  if (errorMessage.includes('database') && errorMessage.includes('does not exist')) {
    return 'DATABASE_NOT_FOUND';
  }
  if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
    return 'PERMISSION_DENIED';
  }
  if (errorMessage.includes('ssl') || errorMessage.includes('tls')) {
    return 'SSL_ERROR';
  }

  return 'UNKNOWN';
};

// Troubleshooting hints based on error type
db.getTroubleshootingHints = (errorType) => {
  const hints = {
    CONNECTION_REFUSED: [
      'Check if PostgreSQL server is running',
      'Verify the database port (default: 5432)',
      'Check firewall settings'
    ],
    DNS_RESOLUTION: [
      'Verify the database host address',
      'Check network connectivity',
      'Ensure DNS resolution is working'
    ],
    TIMEOUT: [
      'Check network latency to database server',
      'Verify database server is responding',
      'Consider increasing connection timeout'
    ],
    AUTHENTICATION: [
      'Verify database username and password',
      'Check user permissions in PostgreSQL',
      'Ensure user can connect from this host'
    ],
    DATABASE_NOT_FOUND: [
      'Create the database if it does not exist',
      'Verify database name in configuration',
      'Check if user has access to the database'
    ],
    PERMISSION_DENIED: [
      'Check user privileges in PostgreSQL',
      'Verify pg_hba.conf configuration',
      'Ensure user can connect from this IP'
    ],
    SSL_ERROR: [
      'Check SSL/TLS configuration',
      'Verify certificate validity',
      'Check SSL mode requirements'
    ],
    UNKNOWN: [
      'Check database server logs',
      'Verify all connection parameters',
      'Contact database administrator'
    ]
  };

  return hints[errorType] || hints.UNKNOWN;
};

// Circuit breaker pattern for database connections
class DatabaseCircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureThreshold = threshold;
    this.timeout = timeout;
    this.failureCount = 0;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }

  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN - database calls are temporarily disabled');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
    log.debug('Circuit breaker reset - connection successful');
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
      log.warn('Circuit breaker opened due to repeated failures', {
        failureCount: this.failureCount,
        threshold: this.failureThreshold,
        nextAttempt: new Date(this.nextAttempt).toISOString()
      });
    }
  }

  getStatus() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      threshold: this.failureThreshold,
      nextAttempt: this.state === 'OPEN' ? new Date(this.nextAttempt).toISOString() : null
    };
  }
}

// Create circuit breaker instance
db.circuitBreaker = new DatabaseCircuitBreaker();

// Wrapped connection test with circuit breaker
db.testConnectionWithCircuitBreaker = async (retries = 3, initialDelay = 2000) => {
  return await db.circuitBreaker.execute(async () => {
    return await db.testConnection(retries, initialDelay);
  });
};

// Note: Signal handlers are now centralized in server.js to avoid duplication
// Database cleanup will be handled through the centralized graceful shutdown process

module.exports = db;
