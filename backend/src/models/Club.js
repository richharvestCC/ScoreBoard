module.exports = (sequelize, DataTypes) => {
  const Club = sequelize.define('Club', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 200]
      }
    },
    founded_year: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1800,
        max: new Date().getFullYear()
      }
    },
    logo_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    contact_email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    contact_phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^[\+]?[0-9\-\s]+$/
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id'
      }
    }
  }, {
    tableName: 'clubs',
    timestamps: true,
    indexes: [
      {
        fields: ['name']
      },
      {
        fields: ['created_by']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  Club.associate = function(models) {
    // Club belongs to User (creator)
    Club.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });

    // Club belongs to many Users through ClubMember
    Club.belongsToMany(models.User, {
      through: 'ClubMember',
      foreignKey: 'club_id',
      otherKey: 'user_id',
      as: 'members'
    });

    // Club has many Matches as home team
    Club.hasMany(models.Match, {
      foreignKey: 'home_club_id',
      as: 'homeMatches'
    });

    // Club has many Matches as away team
    Club.hasMany(models.Match, {
      foreignKey: 'away_club_id',
      as: 'awayMatches'
    });
  };

  return Club;
};