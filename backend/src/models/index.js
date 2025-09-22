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

// Database connection testing with retry logic
db.testConnection = async (retries = 3, delay = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await sequelize.authenticate();
      log.info('Database connection established successfully', {
        attempt,
        database: config.database,
        host: config.host
      });
      return true;
    } catch (error) {
      log.error(`Database connection failed (attempt ${attempt}/${retries})`, {
        error: error.message,
        database: config.database,
        host: config.host,
        attempt,
        retriesRemaining: retries - attempt
      });

      if (attempt === retries) {
        throw new Error(`Database connection failed after ${retries} attempts: ${error.message}`);
      }

      if (attempt < retries) {
        log.info(`Retrying database connection in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
};

db.syncDatabase = async () => {
  const env = process.env.NODE_ENV || 'development';
  const startTime = Date.now();

  try {
    log.info('Starting database synchronization', {
      environment: env,
      database: config.database
    });

    if (env === 'production') {
      log.info('Production mode - using migrations only');
      const migrations = await db.runMigrations();
      const duration = Date.now() - startTime;

      log.info('Production database setup completed', {
        migrationsApplied: migrations.length,
        duration: `${duration}ms`
      });
      return true;
    }

    // Development mode: intelligent migration detection
    const { migrationsExist, pendingMigrations } = await db.checkMigrationsStatus();

    if (migrationsExist || pendingMigrations > 0) {
      log.info('Migrations detected - running migrations instead of sync', {
        pendingMigrations
      });
      const migrations = await db.runMigrations();

      const duration = Date.now() - startTime;
      log.info('Database migration completed', {
        migrationsApplied: migrations.length,
        duration: `${duration}ms`
      });
    } else {
      log.warn('No migrations found - using model sync for development (not recommended for production)');
      await sequelize.sync({ alter: false }); // Changed from alter: true for safety

      const duration = Date.now() - startTime;
      log.info('Database synchronized successfully', {
        method: 'sync',
        duration: `${duration}ms`
      });
    }

    return true;
  } catch (error) {
    const duration = Date.now() - startTime;
    log.error('Database synchronization failed', {
      error: error.message,
      stack: error.stack,
      environment: env,
      duration: `${duration}ms`
    });
    throw new Error(`Database synchronization failed: ${error.message}`);
  }
};

// Enhanced migration status checking
db.checkMigrationsStatus = async () => {
  try {
    const migrationsPath = path.resolve(__dirname, '../../migrations');

    // Check if migrations directory exists
    if (!fs.existsSync(migrationsPath)) {
      log.debug('Migrations directory does not exist', { path: migrationsPath });
      return { migrationsExist: false, pendingMigrations: 0, totalMigrations: 0 };
    }

    const files = fs.readdirSync(migrationsPath);
    const migrationFiles = files.filter(file => file.endsWith('.js'));

    if (migrationFiles.length === 0) {
      log.debug('No migration files found', { path: migrationsPath });
      return { migrationsExist: false, pendingMigrations: 0, totalMigrations: 0 };
    }

    // Check for pending migrations using Umzug
    const { Umzug, SequelizeStorage } = require('umzug');
    const umzug = new Umzug({
      migrations: {
        glob: path.resolve(__dirname, '../../migrations/*.js'),
        resolve: ({ name, path: migrationPath }) => {
          const migration = require(migrationPath);
          return {
            name,
            up: async () => migration.up(sequelize.getQueryInterface(), sequelize.constructor),
            down: async () => migration.down(sequelize.getQueryInterface(), sequelize.constructor),
          };
        },
      },
      context: sequelize.getQueryInterface(),
      storage: new SequelizeStorage({ sequelize }),
      logger: null, // Disable umzug logging here, we handle it ourselves
    });

    const pending = await umzug.pending();
    const executed = await umzug.executed();

    log.debug('Migration status checked', {
      totalMigrations: migrationFiles.length,
      pendingMigrations: pending.length,
      executedMigrations: executed.length
    });

    return {
      migrationsExist: migrationFiles.length > 0,
      pendingMigrations: pending.length,
      totalMigrations: migrationFiles.length,
      executedMigrations: executed.length
    };
  } catch (error) {
    log.error('Failed to check migration status', {
      error: error.message,
      stack: error.stack
    });
    return { migrationsExist: false, pendingMigrations: 0, totalMigrations: 0, error: error.message };
  }
};

// Legacy method for backward compatibility
db.checkMigrationsExist = async () => {
  const status = await db.checkMigrationsStatus();
  return status.migrationsExist;
};

// Run pending migrations with enhanced error handling and logging
db.runMigrations = async () => {
  const { Umzug, SequelizeStorage } = require('umzug');
  const path = require('path');
  const startTime = Date.now();

  try {
    const umzug = new Umzug({
      migrations: {
        glob: path.resolve(__dirname, '../../migrations/*.js'),
        resolve: ({ name, path: migrationPath }) => {
          const migration = require(migrationPath);
          return {
            name,
            up: async () => {
              const migrationStart = Date.now();
              try {
                const result = await migration.up(sequelize.getQueryInterface(), sequelize.constructor);
                const duration = Date.now() - migrationStart;
                log.info(`Migration ${name} completed successfully`, {
                  migration: name,
                  duration: `${duration}ms`,
                  direction: 'up'
                });
                return result;
              } catch (error) {
                const duration = Date.now() - migrationStart;
                log.error(`Migration ${name} failed`, {
                  migration: name,
                  duration: `${duration}ms`,
                  direction: 'up',
                  error: error.message
                });
                throw error;
              }
            },
            down: async () => {
              const migrationStart = Date.now();
              try {
                const result = await migration.down(sequelize.getQueryInterface(), sequelize.constructor);
                const duration = Date.now() - migrationStart;
                log.info(`Migration ${name} rolled back successfully`, {
                  migration: name,
                  duration: `${duration}ms`,
                  direction: 'down'
                });
                return result;
              } catch (error) {
                const duration = Date.now() - migrationStart;
                log.error(`Migration ${name} rollback failed`, {
                  migration: name,
                  duration: `${duration}ms`,
                  direction: 'down',
                  error: error.message
                });
                throw error;
              }
            },
          };
        },
      },
      context: sequelize.getQueryInterface(),
      storage: new SequelizeStorage({ sequelize }),
      logger: {
        info: (message) => log.debug(message, { component: 'umzug' }),
        warn: (message) => log.warn(message, { component: 'umzug' }),
        error: (message) => log.error(message, { component: 'umzug' })
      },
    });

    log.info('Running pending migrations...');

    // Get pending migrations first for logging
    const pending = await umzug.pending();

    if (pending.length === 0) {
      log.info('No pending migrations');
      return [];
    }

    log.info(`Found ${pending.length} pending migrations`, {
      migrations: pending.map(m => m.name)
    });

    // Run the migrations
    const migrations = await umzug.up();
    const totalDuration = Date.now() - startTime;

    log.info(`Applied ${migrations.length} migrations successfully`, {
      migrations: migrations.map(m => m.name),
      totalDuration: `${totalDuration}ms`,
      averageDuration: `${Math.round(totalDuration / migrations.length)}ms`
    });

    return migrations;
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    log.error('Migration execution failed', {
      error: error.message,
      stack: error.stack,
      totalDuration: `${totalDuration}ms`
    });
    throw new Error(`Migration execution failed: ${error.message}`);
  }
};

// Add migration health check function
db.checkMigrationHealth = async () => {
  try {
    const status = await db.checkMigrationsStatus();
    const health = {
      status: 'healthy',
      totalMigrations: status.totalMigrations,
      executedMigrations: status.executedMigrations,
      pendingMigrations: status.pendingMigrations,
      migrationsDirectory: path.resolve(__dirname, '../../migrations')
    };

    if (status.pendingMigrations > 0) {
      health.status = 'pending-migrations';
      health.warning = `${status.pendingMigrations} pending migrations need to be applied`;
    }

    if (status.error) {
      health.status = 'error';
      health.error = status.error;
    }

    log.debug('Migration health check completed', health);
    return health;
  } catch (error) {
    log.error('Migration health check failed', {
      error: error.message,
      stack: error.stack
    });
    return {
      status: 'error',
      error: error.message
    };
  }
};

// Add graceful shutdown handling
process.on('SIGTERM', async () => {
  log.info('SIGTERM received, closing database connections...');
  try {
    await sequelize.close();
    log.info('Database connections closed successfully');
  } catch (error) {
    log.error('Error closing database connections', {
      error: error.message
    });
  }
});

process.on('SIGINT', async () => {
  log.info('SIGINT received, closing database connections...');
  try {
    await sequelize.close();
    log.info('Database connections closed successfully');
  } catch (error) {
    log.error('Error closing database connections', {
      error: error.message
    });
  }
});

module.exports = db;
