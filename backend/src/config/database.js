const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'scoreboard',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test database connection
const testConnection = async () => {
  const { log } = require('./logger');
  try {
    await sequelize.authenticate();
    log.info('✅ Database connection established successfully');
  } catch (error) {
    log.error('❌ Unable to connect to database', {
      error: error.message,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME
    });
    log.error('Database connection failed. Server cannot start without database.');
    throw error; // Re-throw to prevent server startup
  }
};

// Configuration for Sequelize CLI
const config = {
  development: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'scoreboard',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  },
  test: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME_TEST || 'scoreboard_test',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    dialect: 'postgres',
    logging: false,
  },
  production: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};

module.exports = { sequelize, testConnection };

// Export for Sequelize CLI
module.exports[process.env.NODE_ENV || 'development'] = config[process.env.NODE_ENV || 'development'];
module.exports.development = config.development;
module.exports.test = config.test;
module.exports.production = config.production;