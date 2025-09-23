module.exports = (sequelize, DataTypes) => {
const Competition = sequelize.define('Competition', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  competition_type: {
    type: DataTypes.ENUM('league', 'tournament', 'cup'),
    allowNull: false,
    comment: 'league: 리그전, tournament: 토너먼트, cup: 컵대회'
  },
  format: {
    type: DataTypes.ENUM('round_robin', 'knockout', 'mixed', 'group_knockout'),
    allowNull: false,
    defaultValue: 'knockout',
    comment: 'round_robin: 총당리그, knockout: 토너먼트, mixed: 혼합형, group_knockout: 조별예선+결승토너먼트'
  },
  has_group_stage: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '조별 예선 여부'
  },
  group_stage_format: {
    type: DataTypes.ENUM('round_robin', 'single_elimination'),
    allowNull: true,
    comment: '조별 예선 방식 (has_group_stage=true일 때)'
  },
  knockout_stage_format: {
    type: DataTypes.ENUM('single_elimination', 'double_elimination'),
    allowNull: true,
    comment: '결승 토너먼트 방식'
  },
  level: {
    type: DataTypes.ENUM('local', 'regional', 'national', 'international'),
    allowNull: false,
    defaultValue: 'local'
  },
  season: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '시즌 정보 (예: 2025, 2025-Spring, 2025-1차)'
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isAfterStartDate(value) {
        if (value && this.start_date && value <= this.start_date) {
          throw new Error('End date must be after start date');
        }
      }
    }
  },
  registration_start: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '참가 신청 시작일'
  },
  registration_end: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '참가 신청 마감일',
    validate: {
      isAfterRegistrationStart(value) {
        if (value && this.registration_start && value <= this.registration_start) {
          throw new Error('Registration end date must be after registration start date');
        }
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 5000],
      isValidText(value) {
        if (value && typeof value === 'string') {
          const { sanitizeAndValidateText } = require('../utils/sanitizer');
          const result = sanitizeAndValidateText(value, { maxLength: 5000, allowRichText: true });
          if (!result.isValid) {
            throw new Error(result.error);
          }
        }
      }
    },
    set(value) {
      if (value && typeof value === 'string') {
        const { sanitizeAndValidateText } = require('../utils/sanitizer');
        const result = sanitizeAndValidateText(value, { maxLength: 5000, allowRichText: true });
        this.setDataValue('description', result.sanitized);
      } else {
        this.setDataValue('description', value);
      }
    }
  },
  rules: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '대회 규정 및 규칙',
    validate: {
      len: [0, 10000],
      isValidText(value) {
        if (value && typeof value === 'string') {
          const { sanitizeAndValidateText } = require('../utils/sanitizer');
          const result = sanitizeAndValidateText(value, { maxLength: 10000, allowRichText: true });
          if (!result.isValid) {
            throw new Error(result.error);
          }
        }
      }
    },
    set(value) {
      if (value && typeof value === 'string') {
        const { sanitizeAndValidateText } = require('../utils/sanitizer');
        const result = sanitizeAndValidateText(value, { maxLength: 10000, allowRichText: true });
        this.setDataValue('rules', result.sanitized);
      } else {
        this.setDataValue('rules', value);
      }
    }
  },
  max_participants: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 2,
      max: 128
    }
  },
  min_participants: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 2,
    validate: {
      min: 2
    }
  },
  entry_fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  prize_description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 2000],
      isValidText(value) {
        if (value && typeof value === 'string') {
          const { sanitizeAndValidateText } = require('../utils/sanitizer');
          const result = sanitizeAndValidateText(value, { maxLength: 2000, allowRichText: true });
          if (!result.isValid) {
            throw new Error(result.error);
          }
        }
      }
    },
    set(value) {
      if (value && typeof value === 'string') {
        const { sanitizeAndValidateText } = require('../utils/sanitizer');
        const result = sanitizeAndValidateText(value, { maxLength: 2000, allowRichText: true });
        this.setDataValue('prize_description', result.sanitized);
      } else {
        this.setDataValue('prize_description', value);
      }
    }
  },
  venue_info: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '경기장 정보 및 안내사항',
    validate: {
      len: [0, 3000],
      isValidText(value) {
        if (value && typeof value === 'string') {
          const { sanitizeAndValidateText } = require('../utils/sanitizer');
          const result = sanitizeAndValidateText(value, { maxLength: 3000, allowRichText: true });
          if (!result.isValid) {
            throw new Error(result.error);
          }
        }
      }
    },
    set(value) {
      if (value && typeof value === 'string') {
        const { sanitizeAndValidateText } = require('../utils/sanitizer');
        const result = sanitizeAndValidateText(value, { maxLength: 3000, allowRichText: true });
        this.setDataValue('venue_info', result.sanitized);
      } else {
        this.setDataValue('venue_info', value);
      }
    }
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'open_registration', 'registration_closed', 'in_progress', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'draft',
    comment: 'draft: 초안, open_registration: 신청중, registration_closed: 신청마감, in_progress: 진행중, completed: 완료, cancelled: 취소'
  },
  organization_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '주최 조직'
  },
  admin_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '대회 관리자'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '대회 생성자'
  }
}, {
  tableName: 'competitions',
  timestamps: true,
  indexes: [
    {
      fields: ['competition_type']
    },
    {
      fields: ['format']
    },
    {
      fields: ['status']
    },
    {
      fields: ['season']
    },
    {
      fields: ['level']
    },
    {
      fields: ['admin_user_id']
    },
    {
      fields: ['created_by']
    }
  ]
});

// 관계 설정
Competition.associate = (models) => {
  // Competition belongs to User (admin)
  Competition.belongsTo(models.User, {
    foreignKey: 'admin_user_id',
    as: 'admin'
  });

  // Competition belongs to User (creator)
  Competition.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator'
  });

  // Competition belongs to Organization (optional)
  if (models.Organization) {
    Competition.belongsTo(models.Organization, {
      foreignKey: 'organization_id',
      as: 'organization'
    });
  }

  // Competition has many Matches
  Competition.hasMany(models.Match, {
    foreignKey: 'competition_id',
    as: 'matches'
  });

  // Competition has many Participants (through junction table)
  if (models.CompetitionParticipant) {
    Competition.hasMany(models.CompetitionParticipant, {
      foreignKey: 'competition_id',
      as: 'participants'
    });
  }
};

// 인스턴스 메서드
Competition.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());

  // 민감한 정보 제거 (필요시)
  // delete values.some_sensitive_field;

  return values;
};

// 클래스 메서드
Competition.getTemplates = async function() {
  return await this.findAll({
    where: {
      season: 'template'
    },
    order: [['id', 'ASC']]
  });
};

Competition.getByStatus = async function(status) {
  return await this.findAll({
    where: {
      status: status
    },
    order: [['createdAt', 'DESC']]
  });
};

Competition.getActiveCompetitions = async function() {
  return await this.findAll({
    where: {
      status: ['open_registration', 'registration_closed', 'in_progress']
    },
    order: [['start_date', 'ASC']]
  });
};

return Competition;
};