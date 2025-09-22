module.exports = (sequelize, DataTypes) => {
  const ClubMember = sequelize.define('ClubMember', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    club_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Club',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id'
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'player', 'coach', 'staff'),
      allowNull: false,
      defaultValue: 'player'
    },
    jersey_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 99
      }
    },
    position: {
      type: DataTypes.ENUM(
        'goalkeeper', 'defender', 'midfielder', 'forward',
        'center_back', 'left_back', 'right_back', 'defensive_midfielder',
        'central_midfielder', 'attacking_midfielder', 'left_winger',
        'right_winger', 'striker', 'center_forward'
      ),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended', 'injured'),
      allowNull: false,
      defaultValue: 'active'
    },
    joined_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    left_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'club_members',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['club_id', 'user_id']
      },
      {
        unique: true,
        fields: ['club_id', 'jersey_number'],
        where: {
          jersey_number: {
            [sequelize.Sequelize.Op.ne]: null
          },
          is_active: true
        }
      },
      {
        fields: ['role']
      },
      {
        fields: ['status']
      }
    ]
  });

  ClubMember.associate = function(models) {
    // ClubMember belongs to Club
    ClubMember.belongsTo(models.Club, {
      foreignKey: 'club_id',
      as: 'club'
    });

    // ClubMember belongs to User
    ClubMember.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return ClubMember;
};