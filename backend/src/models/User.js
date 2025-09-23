module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    birthdate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: true
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^[\+]?[0-9\-\s]+$/
      }
    },
    profile_image_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('user', 'admin', 'moderator', 'organizer'),
      allowNull: false,
      defaultValue: 'user',
      comment: 'user: 일반사용자, admin: 관리자, moderator: 운영자, organizer: 대회주최자'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '계정 활성화 상태'
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '마지막 로그인 시간'
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '추가 권한 설정 (JSON format)'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id']
      },
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['role']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  User.associate = function(models) {
    // User belongs to many Clubs through ClubMember
    User.belongsToMany(models.Club, {
      through: 'ClubMember',
      foreignKey: 'user_id',
      otherKey: 'club_id',
      as: 'clubs'
    });

    // User has many Clubs as creator
    User.hasMany(models.Club, {
      foreignKey: 'created_by',
      as: 'createdClubs'
    });

    // User has many MatchEvents
    User.hasMany(models.MatchEvent, {
      foreignKey: 'player_id',
      as: 'playerEvents'
    });

    User.hasMany(models.MatchEvent, {
      foreignKey: 'related_player_id',
      as: 'relatedEvents'
    });

    User.hasMany(models.MatchEvent, {
      foreignKey: 'recorded_by',
      as: 'recordedEvents'
    });

    // Competition associations
    User.hasMany(models.Competition, {
      foreignKey: 'admin_user_id',
      as: 'adminCompetitions'
    });

    User.hasMany(models.Competition, {
      foreignKey: 'created_by',
      as: 'createdCompetitions'
    });
  };

  // Instance methods for role and permission checking
  User.prototype.hasRole = function(role) {
    return this.role === role;
  };

  User.prototype.hasAnyRole = function(roles) {
    return roles.includes(this.role);
  };

  User.prototype.canManageUsers = function() {
    return this.hasAnyRole(['admin', 'moderator']);
  };

  User.prototype.canCreateCompetition = function() {
    return this.hasAnyRole(['admin', 'moderator', 'organizer']);
  };

  User.prototype.canManageCompetition = function(competition) {
    if (this.hasRole('admin')) return true;
    if (competition && (competition.admin_user_id === this.id || competition.created_by === this.id)) return true;
    return false;
  };

  User.prototype.canModerateContent = function() {
    return this.hasAnyRole(['admin', 'moderator']);
  };

  User.prototype.hasPermission = function(permission) {
    if (this.hasRole('admin')) return true;
    if (!this.permissions) return false;
    return this.permissions[permission] === true;
  };

  // Class methods for role management
  User.getRoleHierarchy = function() {
    return {
      admin: 4,
      moderator: 3,
      organizer: 2,
      user: 1
    };
  };

  User.getDefaultPermissions = function(role) {
    const permissions = {
      user: {
        create_competition: false,
        manage_own_competitions: true,
        moderate_content: false,
        manage_users: false,
        view_analytics: false
      },
      organizer: {
        create_competition: true,
        manage_own_competitions: true,
        moderate_content: false,
        manage_users: false,
        view_analytics: true
      },
      moderator: {
        create_competition: true,
        manage_own_competitions: true,
        moderate_content: true,
        manage_users: false,
        view_analytics: true
      },
      admin: {
        create_competition: true,
        manage_own_competitions: true,
        moderate_content: true,
        manage_users: true,
        view_analytics: true
      }
    };
    return permissions[role] || permissions.user;
  };

  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());

    // Remove sensitive information
    delete values.password_hash;

    return values;
  };

  return User;
};