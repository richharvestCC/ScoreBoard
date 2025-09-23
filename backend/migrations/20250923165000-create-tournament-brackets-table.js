'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create tournament_brackets table for PR #8 bracket management
    await queryInterface.createTable('tournament_brackets', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      tournament_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'competitions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      round_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '1 = Final, 2 = Semi-final, 3 = Quarter-final, etc.'
      },
      bracket_position: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Position within the round (1, 2, 3, etc.)'
      },
      next_match_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'matches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'The match that the winner advances to'
      },
      home_seed: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Seed number for home team'
      },
      away_seed: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Seed number for away team'
      },
      is_third_place: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether this is a third place playoff match'
      },
      bracket_type: {
        type: Sequelize.ENUM('main', 'third_place'),
        allowNull: false,
        defaultValue: 'main',
        comment: 'Type of bracket match'
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
    await queryInterface.addIndex('tournament_brackets', ['tournament_id']);
    await queryInterface.addIndex('tournament_brackets', ['match_id']);
    await queryInterface.addIndex('tournament_brackets', ['round_number']);
    await queryInterface.addIndex('tournament_brackets', ['bracket_position']);
    await queryInterface.addIndex('tournament_brackets', ['next_match_id']);
    await queryInterface.addIndex('tournament_brackets', ['bracket_type']);

    // Composite index for bracket position queries
    await queryInterface.addIndex('tournament_brackets', ['tournament_id', 'round_number', 'bracket_position']);
  },

  async down(queryInterface, Sequelize) {
    // Drop the tournament_brackets table
    await queryInterface.dropTable('tournament_brackets');
  }
};