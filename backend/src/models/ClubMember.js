const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ClubMember = sequelize.define('ClubMember', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  club_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'clubs',
      key: 'id'
    }
  },
  role: {
    type: DataTypes.ENUM('ADMIN', 'COACH', 'PLAYER', 'STAFF'),
    allowNull: false,
    defaultValue: 'PLAYER'
  },
  position: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Player position like GK, DF, MF, FW'
  },
  jersey_number: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 99
    }
  },
  joined_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'club_members',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'club_id']
    },
    {
      unique: true,
      fields: ['club_id', 'jersey_number'],
      where: {
        jersey_number: {
          [require('sequelize').Op.ne]: null
        },
        is_active: true
      }
    },
    {
      fields: ['role']
    }
  ]
});

module.exports = ClubMember;