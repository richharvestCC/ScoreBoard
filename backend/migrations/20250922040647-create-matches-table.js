'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('matches', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      home_club_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'clubs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      away_club_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'clubs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      match_type: {
        type: Sequelize.ENUM('friendly', 'league', 'cup', 'tournament'),
        allowNull: false,
        defaultValue: 'friendly'
      },
      match_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      venue: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          len: [1, 200]
        }
      },
      status: {
        type: Sequelize.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'scheduled'
      },
      home_score: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      away_score: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 90,
        validate: {
          min: 1,
          max: 200
        }
      },
      referee: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          len: [1, 100]
        }
      },
      weather_conditions: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          len: [1, 100]
        }
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes for performance
    await queryInterface.addIndex('matches', ['match_date']);
    await queryInterface.addIndex('matches', ['status']);
    await queryInterface.addIndex('matches', ['home_club_id']);
    await queryInterface.addIndex('matches', ['away_club_id']);
    await queryInterface.addIndex('matches', ['created_by']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('matches');
  }
};
