const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Match = sequelize.define('Match', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  home_club_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'clubs',
      key: 'id'
    }
  },
  away_club_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'clubs',
      key: 'id'
    }
  },
  match_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  venue: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('SCHEDULED', 'LIVE', 'HALFTIME', 'FINISHED', 'CANCELLED', 'POSTPONED'),
    allowNull: false,
    defaultValue: 'SCHEDULED'
  },
  match_type: {
    type: DataTypes.ENUM('FRIENDLY', 'LEAGUE', 'TOURNAMENT', 'TRAINING'),
    allowNull: false,
    defaultValue: 'FRIENDLY'
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 90,
    validate: {
      min: 1,
      max: 200
    }
  },
  home_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  away_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  referee_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  weather: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ended_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'matches',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['home_club_id']
    },
    {
      fields: ['away_club_id']
    },
    {
      fields: ['match_date']
    },
    {
      fields: ['status']
    },
    {
      fields: ['match_type']
    }
  ]
});

module.exports = Match;