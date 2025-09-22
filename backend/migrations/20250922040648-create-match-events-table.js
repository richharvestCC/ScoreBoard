'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('match_events', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      match_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'matches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      event_type: {
        type: Sequelize.ENUM(
          'GOAL', 'ASSIST', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION',
          'OFFSIDE', 'FOUL', 'CORNER', 'THROW_IN', 'FREE_KICK',
          'PENALTY', 'SAVE', 'MATCH_START', 'MATCH_END', 'HALF_TIME'
        ),
        allowNull: false
      },
      player_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      team_side: {
        type: Sequelize.ENUM('home', 'away'),
        allowNull: true
      },
      minute: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 0,
          max: 200
        }
      },
      extra_time_minute: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 0,
          max: 30
        }
      },
      position_x: {
        type: Sequelize.FLOAT,
        allowNull: true,
        validate: {
          min: 0,
          max: 100
        }
      },
      position_y: {
        type: Sequelize.FLOAT,
        allowNull: true,
        validate: {
          min: 0,
          max: 100
        }
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      related_player_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      sequence_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1
        }
      },
      is_video_available: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      recorded_by: {
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
    await queryInterface.addIndex('match_events', ['match_id']);
    await queryInterface.addIndex('match_events', ['event_type']);
    await queryInterface.addIndex('match_events', ['player_id']);
    await queryInterface.addIndex('match_events', ['minute']);
    await queryInterface.addIndex('match_events', ['sequence_number']);
    await queryInterface.addIndex('match_events', ['recorded_by']);

    // Add composite index for match events chronological order
    await queryInterface.addIndex('match_events', ['match_id', 'sequence_number']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('match_events');
  }
};
