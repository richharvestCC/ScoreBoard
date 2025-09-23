module.exports = (sequelize, DataTypes) => {
  const TournamentBracket = sequelize.define('TournamentBracket', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tournament_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'competitions',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    match_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'matches',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    round_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '1 = Final, 2 = Semi-final, 3 = Quarter-final, etc.'
    },
    bracket_position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Position within the round (1, 2, 3, etc.)'
    },
    next_match_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'matches',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'The match that the winner advances to'
    },
    home_seed: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Seed number of home team/player'
    },
    away_seed: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Seed number of away team/player'
    },
    is_third_place: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether this is a third place playoff match'
    },
    bracket_type: {
      type: DataTypes.ENUM('main', 'third_place'),
      allowNull: false,
      defaultValue: 'main',
      comment: 'Type of bracket match'
    }
  }, {
    tableName: 'tournament_brackets',
    indexes: [
      {
        unique: true,
        fields: ['tournament_id', 'round_number', 'bracket_position']
      },
      {
        fields: ['tournament_id']
      },
      {
        fields: ['match_id']
      },
      {
        fields: ['next_match_id']
      },
      {
        fields: ['round_number']
      }
    ]
  });

  // Define associations
  TournamentBracket.associate = (models) => {
    // Tournament relationship (competitions table)
    TournamentBracket.belongsTo(models.Tournament, {
      foreignKey: 'tournament_id',
      as: 'tournament'
    });

    // Match relationship
    TournamentBracket.belongsTo(models.Match, {
      foreignKey: 'match_id',
      as: 'match'
    });

    // Next match relationship
    TournamentBracket.belongsTo(models.Match, {
      foreignKey: 'next_match_id',
      as: 'nextMatch'
    });
  };

  return TournamentBracket;
};