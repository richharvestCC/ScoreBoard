const { sequelize } = require('../config/database');
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

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized successfully');
  } catch (error) {
    console.error('❌ Database synchronization failed:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Club,
  ClubMember,
  Match,
  MatchEvent,
  syncDatabase
};