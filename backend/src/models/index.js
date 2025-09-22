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

// Add utility functions with resilience
db.testConnection = async (retries = 3, delay = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await sequelize.authenticate();
      console.log(`✅ Database connection established successfully (attempt ${attempt}/${retries})`);
      return true;
    } catch (error) {
      console.error(`❌ Database connection attempt ${attempt}/${retries} failed:`, error.message);

      if (attempt === retries) {
        console.error('💥 All database connection attempts failed. Check your database configuration.');
        throw error;
      }

      console.log(`⏳ Retrying in ${delay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

db.checkConnectionHealth = async () => {
  try {
    await sequelize.authenticate();
    return { healthy: true, error: null };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
};

db.syncDatabase = async () => {
  try {
    // Only use sync in development environment
    // Production should use migrations
    const env = process.env.NODE_ENV || 'development';

    if (env === 'production') {
      console.log('⚠️ In production mode - skipping automatic sync. Please use migrations.');
      return true;
    }

    // In development, use alter: false to prevent automatic schema changes
    // Use migrations for schema changes even in development
    await sequelize.sync({ alter: false });
    console.log('✅ Database synchronized successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to sync database:', error);
    throw error;
  }
};

module.exports = db;
