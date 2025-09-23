module.exports = (sequelize, DataTypes) => {
  const Match = sequelize.define('Match', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    home_club_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clubs',
        key: 'id'
      }
    },
    away_club_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clubs',
        key: 'id'
      }
    },
    match_type: {
      type: DataTypes.ENUM('friendly', 'league', 'cup', 'tournament'),
      allowNull: false,
      defaultValue: 'friendly'
    },
    match_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    venue: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 200]
      }
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'scheduled'
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
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 90,
      validate: {
        min: 1,
        max: 200
      }
    },
    referee: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 100]
      }
    },
    weather_conditions: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 100]
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 2000],
        isValidText(value) {
          if (value && typeof value === 'string') {
            // Check for potentially dangerous content
            const { sanitizeAndValidateText } = require('../utils/sanitizer');
            const result = sanitizeAndValidateText(value, { maxLength: 2000 });
            if (!result.isValid) {
              throw new Error(result.error);
            }
          }
        }
      },
      set(value) {
        if (value && typeof value === 'string') {
          const { sanitizeAndValidateText } = require('../utils/sanitizer');
          const result = sanitizeAndValidateText(value, { maxLength: 2000 });
          this.setDataValue('notes', result.sanitized);
        } else {
          this.setDataValue('notes', value);
        }
      }
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    tournament_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tournaments',
        key: 'id'
      }
    },
    stage: {
      type: DataTypes.ENUM('group', 'round_of_16', 'quarter', 'semi', 'final', 'regular_season', 'playoff'),
      allowNull: true
    },
    round: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1
      }
    },
    competition_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'competitions',
        key: 'id'
      }
    },
    scheduled_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '예정된 경기 날짜 (match_date와 다를 수 있음)'
    },
    estimated_duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 90,
      validate: {
        min: 30,
        max: 240
      },
      comment: '예상 경기 시간 (분)'
    },
    venue_capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0
      },
      comment: '경기장 수용 인원'
    },
    ticket_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      },
      comment: '입장료'
    },
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'critical'),
      allowNull: false,
      defaultValue: 'normal',
      comment: '경기 우선순위 (스케줄링 시 참고)'
    },
    scheduling_status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'rescheduled', 'conflicted'),
      allowNull: false,
      defaultValue: 'pending',
      comment: '스케줄링 상태'
    },
    conflict_reason: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 500]
      },
      comment: '스케줄 충돌 사유'
    },
    auto_scheduled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '자동 스케줄링 여부'
    }
  }, {
    tableName: 'matches',
    timestamps: true,
    indexes: [
      {
        fields: ['match_date']
      },
      {
        fields: ['status']
      },
      {
        fields: ['home_club_id']
      },
      {
        fields: ['away_club_id']
      },
      {
        fields: ['created_by']
      },
      {
        fields: ['tournament_id']
      }
    ]
  });

  Match.associate = function(models) {
    // Home club relationship
    Match.belongsTo(models.Club, {
      foreignKey: 'home_club_id',
      as: 'homeClub'
    });

    // Away club relationship
    Match.belongsTo(models.Club, {
      foreignKey: 'away_club_id',
      as: 'awayClub'
    });

    // Creator relationship
    Match.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });

    // Tournament relationship
    Match.belongsTo(models.Tournament, {
      foreignKey: 'tournament_id',
      as: 'tournament'
    });

    // Competition relationship
    Match.belongsTo(models.Competition, {
      foreignKey: 'competition_id',
      as: 'competition'
    });

    // Match events relationship
    Match.hasMany(models.MatchEvent, {
      foreignKey: 'match_id',
      as: 'events'
    });

    // Match statistics relationship
    Match.hasOne(models.MatchStatistics, {
      foreignKey: 'match_id',
      as: 'statistics'
    });
  };

  return Match;
};