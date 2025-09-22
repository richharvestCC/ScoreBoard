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
  };

  return User;
};