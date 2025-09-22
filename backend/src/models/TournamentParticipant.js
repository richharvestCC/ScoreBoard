module.exports = (sequelize, DataTypes) => {
  const TournamentParticipant = sequelize.define('TournamentParticipant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tournament_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tournaments',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  participant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Can be user_id or club_id depending on participant_type'
  },
  participant_type: {
    type: DataTypes.ENUM('user', 'club'),
    allowNull: false,
    defaultValue: 'user'
  },
  joined_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('active', 'withdrawn', 'disqualified'),
    allowNull: false,
    defaultValue: 'active'
  },
  group_name: {
    type: DataTypes.STRING(1),
    allowNull: true,
    comment: 'Group assignment for group stage tournaments (A, B, C, etc.)'
  },
  seed_number: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Seeding position for knockout tournaments'
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Tournament points (for league format)'
  },
  wins: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  draws: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  losses: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  goals_for: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  goals_against: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  goal_difference: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.goals_for - this.goals_against;
    }
  },
  matches_played: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.wins + this.draws + this.losses;
    }
  }
}, {
  tableName: 'tournament_participants',
  indexes: [
    {
      unique: true,
      fields: ['tournament_id', 'participant_id', 'participant_type']
    },
    {
      fields: ['tournament_id', 'group_name']
    },
    {
      fields: ['tournament_id', 'points', 'goal_difference']
    }
  ]
});

  // Define associations
  TournamentParticipant.associate = (models) => {
    // Tournament relationship
    TournamentParticipant.belongsTo(models.Tournament, {
      foreignKey: 'tournament_id',
      as: 'tournament'
    });

    // Dynamic association based on participant_type
    // This will be handled in queries rather than static associations
    // since we can't have conditional associations in Sequelize
  };

  return TournamentParticipant;
};