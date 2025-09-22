module.exports = (sequelize, DataTypes) => {
  const Tournament = sequelize.define('Tournament', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tournament_type: {
    type: DataTypes.ENUM('league', 'tournament'),
    allowNull: false
  },
  format: {
    type: DataTypes.ENUM('round_robin', 'knockout', 'mixed'),
    allowNull: false,
    defaultValue: 'knockout'
  },
  has_group_stage: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  level: {
    type: DataTypes.ENUM('local', 'national', 'international'),
    allowNull: false,
    defaultValue: 'local'
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  max_participants: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  entry_fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  prize_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rules: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'open', 'closed', 'in_progress', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'draft'
  },
  organization_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'organizations',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  admin_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  }
}, {
  tableName: 'tournaments',
  indexes: [
    {
      fields: ['tournament_type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['admin_user_id']
    },
    {
      fields: ['start_date', 'end_date']
    }
  ]
});

  // Define associations
  Tournament.associate = (models) => {
    // Admin user relationship
    Tournament.belongsTo(models.User, {
      foreignKey: 'admin_user_id',
      as: 'admin'
    });

    // Organization relationship (commented out until Organization model is created)
    // Tournament.belongsTo(models.Organization, {
    //   foreignKey: 'organization_id',
    //   as: 'organization'
    // });

    // Participants relationship
    Tournament.hasMany(models.TournamentParticipant, {
      foreignKey: 'tournament_id',
      as: 'participants'
    });

    // Matches relationship
    Tournament.hasMany(models.Match, {
      foreignKey: 'tournament_id',
      as: 'matches'
    });
  };

  return Tournament;
};