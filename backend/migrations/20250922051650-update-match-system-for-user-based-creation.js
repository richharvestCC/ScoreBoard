'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add organizations table
    await queryInterface.createTable('organizations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      org_type: {
        type: Sequelize.ENUM('general', 'pro_league', 'national_fa'),
        allowNull: false,
        defaultValue: 'general'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    // Add tournaments table
    await queryInterface.createTable('tournaments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tournament_type: {
        type: Sequelize.ENUM('league', 'tournament'),
        allowNull: false
      },
      format: {
        type: Sequelize.ENUM('round_robin', 'knockout', 'mixed'),
        allowNull: false,
        defaultValue: 'knockout'
      },
      has_group_stage: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      level: {
        type: Sequelize.ENUM('local', 'national', 'international'),
        allowNull: false,
        defaultValue: 'local'
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      max_participants: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      entry_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      prize_description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      rules: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      status: {
        type: Sequelize.ENUM('draft', 'open', 'closed', 'in_progress', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'draft'
      },
      organization_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'organizations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      admin_user_id: {
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

    // Add user_roles table for permissions
    await queryInterface.createTable('user_roles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      role_type: {
        type: Sequelize.ENUM('tournament_admin', 'organization_admin'),
        allowNull: false
      },
      entity_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      granted_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      granted_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    // Update clubs table to add club_type
    await queryInterface.addColumn('clubs', 'club_type', {
      type: Sequelize.ENUM('general', 'pro', 'youth', 'national'),
      allowNull: false,
      defaultValue: 'general'
    });

    // Update matches table with new structure - safely modify enum
    await queryInterface.sequelize.query(`
      ALTER TABLE matches ALTER COLUMN match_type DROP DEFAULT;
      DROP TYPE IF EXISTS "enum_matches_match_type_new";
      CREATE TYPE "enum_matches_match_type_new" AS ENUM('practice', 'casual', 'friendly', 'league', 'tournament', 'a_friendly', 'a_tournament');
      ALTER TABLE matches ALTER COLUMN match_type TYPE "enum_matches_match_type_new" USING match_type::text::"enum_matches_match_type_new";
      DROP TYPE IF EXISTS "enum_matches_match_type";
      ALTER TYPE "enum_matches_match_type_new" RENAME TO "enum_matches_match_type";
      ALTER TABLE matches ALTER COLUMN match_type SET DEFAULT 'casual';
    `);

    await queryInterface.addColumn('matches', 'match_number', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
      comment: 'Unique match identifier (001, 002, 003...)'
    });

    await queryInterface.addColumn('matches', 'tournament_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'tournaments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('matches', 'round_number', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Round number within tournament/league'
    });

    await queryInterface.addColumn('matches', 'display_order', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Display order for sorting matches'
    });

    await queryInterface.addColumn('matches', 'stage', {
      type: Sequelize.ENUM('group', 'round_of_16', 'quarter', 'semi', 'final', 'regular_season', 'playoff'),
      allowNull: true
    });

    await queryInterface.addColumn('matches', 'group_name', {
      type: Sequelize.STRING(1),
      allowNull: true,
      comment: 'Group name for group stage (A, B, C, etc.)'
    });

    await queryInterface.addColumn('matches', 'is_public', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });

    await queryInterface.addColumn('matches', 'organizer_type', {
      type: Sequelize.ENUM('user', 'club_admin', 'tournament_admin', 'organization_admin'),
      allowNull: false,
      defaultValue: 'user'
    });

    // Add indexes
    await queryInterface.addIndex('user_roles', ['user_id', 'role_type', 'entity_id'], { unique: true });
    await queryInterface.addIndex('tournaments', ['tournament_type']);
    await queryInterface.addIndex('tournaments', ['status']);
    await queryInterface.addIndex('tournaments', ['admin_user_id']);
    await queryInterface.addIndex('matches', ['match_number'], { unique: true });
    await queryInterface.addIndex('matches', ['tournament_id']);
    await queryInterface.addIndex('matches', ['round_number']);
    await queryInterface.addIndex('matches', ['display_order']);
    await queryInterface.addIndex('matches', ['stage']);
    await queryInterface.addIndex('matches', ['organizer_type']);
    await queryInterface.addIndex('organizations', ['org_type']);
    await queryInterface.addIndex('clubs', ['club_type']);
  },

  async down(queryInterface, Sequelize) {
    // Remove added columns
    await queryInterface.removeColumn('matches', 'organizer_type');
    await queryInterface.removeColumn('matches', 'is_public');
    await queryInterface.removeColumn('matches', 'group_name');
    await queryInterface.removeColumn('matches', 'stage');
    await queryInterface.removeColumn('matches', 'display_order');
    await queryInterface.removeColumn('matches', 'round_number');
    await queryInterface.removeColumn('matches', 'tournament_id');
    await queryInterface.removeColumn('matches', 'match_number');
    await queryInterface.removeColumn('clubs', 'club_type');

    // Revert match_type enum
    await queryInterface.changeColumn('matches', 'match_type', {
      type: Sequelize.ENUM('friendly', 'league', 'cup', 'tournament'),
      allowNull: false,
      defaultValue: 'friendly'
    });

    // Drop tables
    await queryInterface.dropTable('user_roles');
    await queryInterface.dropTable('tournaments');
    await queryInterface.dropTable('organizations');
  }
};
