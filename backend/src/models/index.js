'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
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

// Add utility functions
db.testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

db.syncDatabase = async () => {
  const env = process.env.NODE_ENV || 'development';

  try {
    if (env === 'production') {
      console.log('🏭 Production mode - using migrations only');
      await db.runMigrations();
      return true;
    }

    // Development mode: check if migrations should be used
    const migrationsExist = await db.checkMigrationsExist();

    if (migrationsExist) {
      console.log('📋 Migrations detected - running migrations instead of sync');
      await db.runMigrations();
    } else {
      console.log('🔄 No migrations found - using model sync for development');
      await sequelize.sync({ alter: true });
      console.log('✅ Database synchronized successfully.');
    }

    return true;
  } catch (error) {
    console.error('❌ Unable to sync/migrate database:', error);
    throw error;
  }
};

// Check if migrations directory has any files
db.checkMigrationsExist = async () => {
  const fs = require('fs');
  const path = require('path');

  try {
    const migrationsPath = path.resolve(__dirname, '../../migrations');
    const files = fs.readdirSync(migrationsPath);
    const migrationFiles = files.filter(file => file.endsWith('.js'));
    return migrationFiles.length > 0;
  } catch (error) {
    return false;
  }
};

// Run pending migrations
db.runMigrations = async () => {
  const { Umzug, SequelizeStorage } = require('umzug');
  const path = require('path');

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
    logger: console,
  });

  console.log('📋 Running pending migrations...');
  const migrations = await umzug.up();

  if (migrations.length === 0) {
    console.log('✅ No pending migrations');
  } else {
    console.log(`✅ Applied ${migrations.length} migrations:`, migrations.map(m => m.name));
  }

  return migrations;
};

module.exports = db;
