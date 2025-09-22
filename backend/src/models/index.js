const { sequelize, testConnection } = require('../config/database');
const User = require('./User');
const Club = require('./Club');
const ClubMember = require('./ClubMember');
const Match = require('./Match');
const MatchEvent = require('./MatchEvent');

// Define associations
User.hasMany(ClubMember, { foreignKey: 'user_id', as: 'clubMemberships' });
ClubMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Club.hasMany(ClubMember, { foreignKey: 'club_id', as: 'members' });
ClubMember.belongsTo(Club, { foreignKey: 'club_id', as: 'club' });

Club.hasMany(Match, { foreignKey: 'home_club_id', as: 'homeMatches' });
Club.hasMany(Match, { foreignKey: 'away_club_id', as: 'awayMatches' });
Match.belongsTo(Club, { foreignKey: 'home_club_id', as: 'homeClub' });
Match.belongsTo(Club, { foreignKey: 'away_club_id', as: 'awayClub' });

Match.hasMany(MatchEvent, { foreignKey: 'match_id', as: 'events' });
MatchEvent.belongsTo(Match, { foreignKey: 'match_id', as: 'match' });

User.hasMany(MatchEvent, { foreignKey: 'player_id', as: 'playerEvents' });
MatchEvent.belongsTo(User, { foreignKey: 'player_id', as: 'player' });

User.hasMany(MatchEvent, { foreignKey: 'created_by', as: 'recordedEvents' });
MatchEvent.belongsTo(User, { foreignKey: 'created_by', as: 'recorder' });

// Database operations
const syncDatabase = async () => {
  const { log } = require('../config/logger');
  try {
    // In development, we can still use sync for convenience
    // In production, migrations should be run separately
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      log.info('✅ Database synchronized successfully (development mode)');
    } else {
      // In production, just verify connection and models
      await sequelize.authenticate();
      log.info('✅ Database connection verified (production mode)');
      log.warn('⚠️  Run migrations separately in production: npm run migrate');
    }
  } catch (error) {
    log.error('❌ Database operation failed', { error: error.message });
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  User,
  Club,
  ClubMember,
  Match,
  MatchEvent,
  syncDatabase
};