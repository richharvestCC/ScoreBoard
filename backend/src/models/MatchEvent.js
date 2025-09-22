module.exports = (sequelize, DataTypes) => {
  const MatchEvent = sequelize.define('MatchEvent', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    match_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'matches',
        key: 'id'
      }
    },
    event_type: {
      type: DataTypes.ENUM(
        'GOAL', 'ASSIST', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION',
        'OFFSIDE', 'FOUL', 'CORNER', 'THROW_IN', 'FREE_KICK',
        'PENALTY', 'SAVE', 'MATCH_START', 'MATCH_END', 'HALF_TIME'
      ),
      allowNull: false
    },
    player_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    team_side: {
      type: DataTypes.ENUM('home', 'away'),
      allowNull: true
    },
    minute: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 200
      }
    },
    extra_time_minute: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 30
      }
    },
    position_x: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      }
    },
    position_y: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    related_player_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    sequence_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    is_video_available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    recorded_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'match_events',
    timestamps: true,
    indexes: [
      {
        // Unique constraint to prevent duplicate sequence numbers per match
        unique: true,
        fields: ['match_id', 'sequence_number']
      },
      {
        // Composite index for common queries
        fields: ['match_id', 'event_type']
      },
      {
        // Index for player queries
        fields: ['player_id']
      },
      {
        // Index for time-based queries
        fields: ['match_id', 'minute']
      }
    ]
  });

  MatchEvent.associate = function(models) {
    // Match relationship
    MatchEvent.belongsTo(models.Match, {
      foreignKey: 'match_id',
      as: 'match'
    });

    // Player relationship
    MatchEvent.belongsTo(models.User, {
      foreignKey: 'player_id',
      as: 'player'
    });

    // Related player relationship (for assists, substitutions, etc.)
    MatchEvent.belongsTo(models.User, {
      foreignKey: 'related_player_id',
      as: 'relatedPlayer'
    });

    // Recorder relationship
    MatchEvent.belongsTo(models.User, {
      foreignKey: 'recorded_by',
      as: 'recorder'
    });
  };

  return MatchEvent;
};