module.exports = (sequelize, DataTypes) => {
  const MatchStatistics = sequelize.define('MatchStatistics', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    match_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'matches',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    // Possession stats
    home_possession: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      },
      comment: 'Home team possession percentage'
    },
    away_possession: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      },
      comment: 'Away team possession percentage'
    },
    // Shot stats
    home_shots: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    away_shots: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    home_shots_on_target: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    away_shots_on_target: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    // Pass stats
    home_passes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    away_passes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    home_pass_accuracy: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      },
      comment: 'Home team pass accuracy percentage'
    },
    away_pass_accuracy: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      },
      comment: 'Away team pass accuracy percentage'
    },
    // Foul stats
    home_fouls: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    away_fouls: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    home_yellow_cards: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    away_yellow_cards: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    home_red_cards: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    away_red_cards: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    // Corner and offside stats
    home_corners: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    away_corners: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    home_offsides: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    away_offsides: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    // Additional stats
    home_saves: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    away_saves: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional notes about match statistics'
    }
  }, {
    tableName: 'match_statistics',
    indexes: [
      {
        unique: true,
        fields: ['match_id']
      }
    ]
  });

  // Define associations
  MatchStatistics.associate = (models) => {
    // Match relationship
    MatchStatistics.belongsTo(models.Match, {
      foreignKey: 'match_id',
      as: 'match'
    });
  };

  return MatchStatistics;
};