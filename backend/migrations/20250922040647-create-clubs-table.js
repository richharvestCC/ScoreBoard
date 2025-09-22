'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('clubs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: [1, 100]
        }
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          len: [1, 200]
        }
      },
      founded_year: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 1800,
          max: new Date().getFullYear()
        }
      },
      logo_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      contact_email: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          isEmail: true
        }
      },
      contact_phone: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          is: /^[\+]?[0-9\-\s]+$/
        }
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

    // Add indexes for performance
    await queryInterface.addIndex('clubs', ['name']);
    await queryInterface.addIndex('clubs', ['created_by']);
    await queryInterface.addIndex('clubs', ['is_active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('clubs');
  }
};
