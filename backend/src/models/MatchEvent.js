const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MatchEvent = sequelize.define('MatchEvent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  match_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'matches',
      key: 'id'
    }
  },
  player_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  event_type: {
    type: DataTypes.ENUM(
      'GOAL', 'ASSIST', 'YELLOW_CARD', 'RED_CARD',
      'SUBSTITUTION_IN', 'SUBSTITUTION_OUT',
      'PENALTY_GOAL', 'PENALTY_MISS', 'OWN_GOAL',
      'MATCH_START', 'MATCH_END', 'HALFTIME_START', 'HALFTIME_END'
    ),
    allowNull: false
  },
  minute: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 200
    }
  },
  second: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 59
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Additional event data like substitution details, card reason, etc.'
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'User who recorded this event'
  }
}, {
  tableName: 'match_events',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['match_id']
    },
    {
      fields: ['player_id']
    },
    {
      fields: ['event_type']
    },
    {
      fields: ['minute']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = MatchEvent;